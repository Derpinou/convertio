/**
 * Les codecs multithread (AVIF, JPEG XL, OxiPNG) lancent des workers imbriqués.
 * Certains environnements ne le permettent pas (WebViews, Electron, Safari < 15.5) :
 * l'initialisation du codec attendrait alors indéfiniment.
 */
function supportsNestedWorkers(): Promise<boolean> {
	return new Promise((resolve) => {
		let worker: Worker;
		try {
			worker = new Worker(new URL('./probe.worker.ts', import.meta.url), { type: 'module' });
		} catch {
			resolve(false);
			return;
		}
		const done = (supported: boolean) => {
			clearTimeout(timer);
			worker.terminate();
			resolve(supported);
		};
		const timer = setTimeout(() => done(false), 3000);
		worker.addEventListener('message', () => done(true));
		worker.addEventListener('error', () => done(false));
	});
}

let check: Promise<boolean> | undefined;

/**
 * À appeler dans le worker avant tout chargement de codec. Sans workers imbriqués, on masque
 * `SharedArrayBuffer` : la détection de jSquash (wasm-feature-detect) conclut alors à l'absence
 * de threads et charge les versions monothread des codecs.
 */
export function ensureThreadingSupport(): Promise<boolean> {
	check ??= (async () => {
		if (typeof SharedArrayBuffer === 'undefined') return false;
		if (await supportsNestedWorkers()) return true;
		(globalThis as { SharedArrayBuffer?: unknown }).SharedArrayBuffer = undefined;
		return false;
	})();
	return check;
}
