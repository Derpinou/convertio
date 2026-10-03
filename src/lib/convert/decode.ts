import type { FormatId } from '$lib/formats';
import { MAX_PIXELS } from './pixels';
import { ConvertError, type RawImage, type WorkerConfig } from './types';

type WasmDecoder = (buffer: ArrayBuffer) => Promise<RawImage>;

/**
 * Décodeurs WebAssembly, utilisés quand le navigateur ne sait pas lire le format
 * (HEIC hors Safari, JPEG XL, TIFF…) ou quand l'image dépasse la taille maximale d'un canvas.
 */
export const WASM_DECODERS: Partial<Record<FormatId, WasmDecoder>> = {
	jpeg: async (buffer) => (await import('@jsquash/jpeg/decode.js')).default(buffer),
	png: async (buffer) => (await import('@jsquash/png/decode.js')).default(buffer),
	webp: async (buffer) => (await import('@jsquash/webp/decode.js')).default(buffer),
	avif: async (buffer) => {
		const image = await (await import('@jsquash/avif/decode.js')).default(buffer);
		if (!image) throw new ConvertError('decode-failed');
		return image;
	},
	jxl: async (buffer) => (await import('@jsquash/jxl/decode.js')).default(buffer),
	heic: async (buffer) => (await import('./decoders/heic')).decodeHeic(buffer),
	tiff: async (buffer) => (await import('./decoders/tiff')).decodeTiff(buffer)
};

class CanvasLimitError extends Error {}

/** Décodage natif du navigateur : rapide, gère l'orientation EXIF. */
async function decodeNative(blob: Blob, config: WorkerConfig): Promise<RawImage> {
	const bitmap = await createImageBitmap(blob, {
		imageOrientation: 'from-image',
		premultiplyAlpha: 'none'
	});
	try {
		const { width, height } = bitmap;
		if (width * height > MAX_PIXELS) throw new ConvertError('too-large');
		if (width * height > config.maxCanvasPixels) throw new CanvasLimitError();
		const canvas = new OffscreenCanvas(width, height);
		const context = canvas.getContext('2d', { willReadFrequently: true });
		if (!context) throw new CanvasLimitError();
		context.drawImage(bitmap, 0, 0);
		return context.getImageData(0, 0, width, height);
	} finally {
		bitmap.close();
	}
}

export async function decode(
	blob: Blob,
	format: FormatId,
	config: WorkerConfig
): Promise<RawImage> {
	// Le SVG a besoin du DOM : il est rastérisé dans le thread principal (voir svg.ts).
	if (format === 'svg') throw new ConvertError('svg-in-worker');

	try {
		return await decodeNative(blob, config);
	} catch (error) {
		if (error instanceof ConvertError) throw error;
	}

	const wasmDecoder = WASM_DECODERS[format];
	if (!wasmDecoder) throw new ConvertError('decode-failed');
	let image: RawImage;
	try {
		image = await wasmDecoder(await blob.arrayBuffer());
	} catch (error) {
		if (error instanceof ConvertError || error instanceof RangeError) throw error;
		throw new ConvertError('decode-failed');
	}
	if (image.width * image.height > MAX_PIXELS) throw new ConvertError('too-large');
	return image;
}
