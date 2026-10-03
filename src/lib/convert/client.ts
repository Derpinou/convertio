import * as Comlink from 'comlink';
import { FORMATS, formatFromMime, formatFromName, type FormatId } from '$lib/formats';
import type { WorkerApi } from './convert.worker';
import { sniffFormat, SNIFF_BYTES } from './sniff';
import { rasterizeSvg } from './svg';
import type { ConvertResult, ConvertSettings, RawImage, WorkerConfig } from './types';

const IOS_CANVAS_LIMIT = 16_777_216; // 4096 × 4096
const DESKTOP_CANVAS_LIMIT = 268_435_456; // 16384 × 16384

function isIos(): boolean {
	const ua = navigator.userAgent;
	return /iP(hone|od|ad)/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

function workerConfig(): WorkerConfig {
	return { maxCanvasPixels: isIos() ? IOS_CANVAS_LIMIT : DESKTOP_CANVAS_LIMIT };
}

/** Peu de workers sur mobile : chaque conversion peut occuper plusieurs centaines de Mo. */
function poolSize(): number {
	const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
	if (isIos() || (memory !== undefined && memory <= 4)) return 1;
	return Math.max(1, Math.min(3, Math.floor((navigator.hardwareConcurrency || 2) / 2)));
}

function spawnWorker(): { worker: Worker; api: Comlink.Remote<WorkerApi> } {
	const worker = new Worker(new URL('./convert.worker.ts', import.meta.url), {
		type: 'module',
		name: 'convertio'
	});
	const api = Comlink.wrap<WorkerApi>(worker);
	void api.configure(workerConfig());
	return { worker, api };
}

interface PoolWorker {
	worker: Worker;
	api: Comlink.Remote<WorkerApi>;
	/** Rejetée si le worker plante (mémoire saturée…) : Comlink ne le détecte pas seul. */
	crashed: Promise<never>;
}

class WorkerPool {
	#idle: PoolWorker[] = [];
	#count = 0;
	#waiting: Array<(worker: PoolWorker) => void> = [];

	constructor(private readonly size: number) {}

	#spawn(): PoolWorker {
		const { worker, api } = spawnWorker();
		const crashed = new Promise<never>((_, reject) => {
			worker.addEventListener('error', (event) => {
				event.preventDefault();
				reject(new RangeError('worker crashed'));
			});
		});
		crashed.catch(() => {});
		this.#count++;
		return { worker, api, crashed };
	}

	#acquire(): Promise<PoolWorker> {
		const idle = this.#idle.pop();
		if (idle) return Promise.resolve(idle);
		if (this.#count < this.size) return Promise.resolve(this.#spawn());
		return new Promise((resolve) => this.#waiting.push(resolve));
	}

	#release(entry: PoolWorker, healthy: boolean) {
		if (!healthy) {
			entry.worker.terminate();
			this.#count--;
			const next = this.#waiting.shift();
			if (next) next(this.#spawn());
			return;
		}
		const next = this.#waiting.shift();
		if (next) next(entry);
		else this.#idle.push(entry);
	}

	async run<T>(
		task: (api: Comlink.Remote<WorkerApi>) => Promise<T>,
		onStart?: () => void
	): Promise<T> {
		const entry = await this.#acquire();
		onStart?.();
		let healthy = true;
		try {
			return await Promise.race([task(entry.api), entry.crashed]);
		} catch (error) {
			healthy = !(error instanceof RangeError && error.message === 'worker crashed');
			throw error;
		} finally {
			this.#release(entry, healthy);
		}
	}
}

let pool: WorkerPool | undefined;

function getPool(): WorkerPool {
	pool ??= new WorkerPool(poolSize());
	return pool;
}

/** Détecte le format réel du fichier (octets d'en-tête), puis à défaut son type MIME ou son extension. */
export async function detectFormat(file: File): Promise<FormatId | null> {
	const head = new Uint8Array(await file.slice(0, SNIFF_BYTES).arrayBuffer());
	const format = sniffFormat(head) ?? formatFromMime(file.type) ?? formatFromName(file.name);
	return format && FORMATS[format].input ? format : null;
}

export async function convertImage(
	file: File,
	sourceFormat: FormatId,
	settings: ConvertSettings,
	onStart?: () => void
): Promise<ConvertResult> {
	return getPool().run(async (api) => {
		if (sourceFormat === 'svg') {
			const raster: RawImage = await rasterizeSvg(
				file,
				settings.svgSize,
				workerConfig().maxCanvasPixels
			);
			return api.convert(Comlink.transfer(raster, [raster.data.buffer]), sourceFormat, settings);
		}
		return api.convert(file, sourceFormat, settings);
	}, onStart);
}

/**
 * Précharge tous les codecs dans un worker dédié, créé une fois le service worker actif :
 * ses requêtes passent par le service worker, qui met les .wasm en cache.
 */
export async function warmupCodecs(): Promise<void> {
	const { worker, api } = spawnWorker();
	try {
		await api.warmup();
	} finally {
		worker.terminate();
	}
}
