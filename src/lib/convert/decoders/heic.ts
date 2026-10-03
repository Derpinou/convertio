import wasmUrl from 'libheif-js/libheif-wasm/libheif.wasm?url';
import type { LibHeif } from 'libheif-js/libheif-wasm/libheif.js';
import { ConvertError, type RawImage } from '../types';

let libheif: Promise<LibHeif> | undefined;

export function loadLibheif(): Promise<LibHeif> {
	libheif ??= (async () => {
		const [{ default: factory }, wasmBinary] = await Promise.all([
			import('libheif-js/libheif-wasm/libheif.js'),
			fetch(wasmUrl).then((response) => response.arrayBuffer())
		]);
		return new Promise<LibHeif>((resolve, reject) => {
			const module = factory({
				wasmBinary,
				// Avec `wasmBinary`, l'initialisation peut se terminer avant le retour de `factory` :
				// on attend une micro-tâche pour que `module` soit bien affecté.
				onRuntimeInitialized: () => queueMicrotask(() => resolve(module)),
				onAbort: (reason) => reject(new Error(String(reason)))
			});
		});
	})();
	libheif.catch(() => (libheif = undefined));
	return libheif;
}

/** Décode l'image principale d'un fichier HEIC/HEIF (libheif, LGPL-3.0). */
export async function decodeHeic(buffer: ArrayBuffer): Promise<RawImage> {
	const lib = await loadLibheif();
	const images = new lib.HeifDecoder().decode(new Uint8Array(buffer));
	if (!images.length) throw new ConvertError('decode-failed');
	const image = images.find((candidate) => candidate.is_primary()) ?? images[0];
	try {
		const width = image.get_width();
		const height = image.get_height();
		const target = { data: new Uint8ClampedArray(width * height * 4), width, height };
		await new Promise<void>((resolve, reject) => {
			image.display(target, (result) =>
				result ? resolve() : reject(new ConvertError('decode-failed'))
			);
		});
		return target;
	} finally {
		for (const candidate of images) candidate.free();
	}
}
