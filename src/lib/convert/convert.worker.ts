import * as Comlink from 'comlink';
import { OUTPUT_FORMATS, type FormatId } from '$lib/formats';
import { decode, WASM_DECODERS } from './decode';
import { encode, prepare } from './encode';
import { MAX_PIXELS } from './pixels';
import { ensureThreadingSupport } from './threading';
import { makeThumbnail } from './thumbnail';
import {
	ConvertError,
	type ConvertResult,
	type ConvertSettings,
	type RawImage,
	type WorkerConfig
} from './types';

let config: WorkerConfig = { maxCanvasPixels: 16_777_216 };

const api = {
	configure(next: WorkerConfig) {
		config = next;
	},

	async convert(
		input: Blob | RawImage,
		sourceFormat: FormatId,
		settings: ConvertSettings
	): Promise<ConvertResult> {
		await ensureThreadingSupport();
		const decoded = input instanceof Blob ? await decode(input, sourceFormat, config) : input;
		if (decoded.width * decoded.height > MAX_PIXELS) throw new ConvertError('too-large');
		const prepared = prepare(decoded, settings);
		const [encoded, thumbnail] = await Promise.all([
			encode(prepared, settings),
			makeThumbnail(prepared, config.maxCanvasPixels).catch(() => undefined)
		]);
		return { ...encoded, thumbnail };
	},

	/**
	 * Charge et initialise tous les codecs en convertissant une image minuscule vers chaque
	 * format, puis en la relisant. Le service worker met ainsi en cache tous les .wasm
	 * nécessaires à cet appareil : l'application fonctionne ensuite entièrement hors ligne.
	 */
	async warmup(): Promise<void> {
		await ensureThreadingSupport();
		const sample: RawImage = {
			data: new Uint8ClampedArray([
				255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255, 255, 255, 255, 0
			]),
			width: 2,
			height: 2
		};
		const base: ConvertSettings = {
			format: 'png',
			quality: 80,
			lossless: false,
			background: '#ffffff',
			pngOptimize: false,
			icoSizes: [16],
			svgSize: null
		};
		const tasks: Promise<unknown>[] = OUTPUT_FORMATS.map(async (format) => {
			const settings = { ...base, format };
			const { blob } = await encode(prepare(sample, settings), settings);
			await WASM_DECODERS[format]?.(await blob.arrayBuffer());
		});
		tasks.push(import('./decoders/heic').then(({ loadLibheif }) => loadLibheif()));
		const results = await Promise.allSettled(tasks);
		const failures = results.filter((outcome) => outcome.status === 'rejected');
		if (failures.length) {
			console.error(failures);
			throw new Error(`${failures.length} codec(s) indisponible(s)`);
		}
	}
};

export type WorkerApi = typeof api;

Comlink.expose(api);
