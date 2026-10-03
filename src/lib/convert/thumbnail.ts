import { toImageData } from './image-data';
import { fitWithin } from './pixels';
import type { RawImage } from './types';

export const THUMBNAIL_SIZE = 192;

/** Vignette PNG : fonctionne pour tous les formats, y compris ceux que le navigateur n'affiche pas. */
export async function makeThumbnail(image: RawImage, maxCanvasPixels: number): Promise<Blob> {
	const [width, height] = fitWithin(image.width, image.height, THUMBNAIL_SIZE);
	const canvas = new OffscreenCanvas(width, height);
	const context = canvas.getContext('2d');
	if (!context) throw new Error('2d context unavailable');

	if (image.width * image.height <= maxCanvasPixels) {
		const bitmap = await createImageBitmap(toImageData(image));
		context.imageSmoothingQuality = 'high';
		context.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();
	} else {
		// Trop grande pour un canvas (iOS) : réduction en WebAssembly.
		const { default: resize } = await import('@jsquash/resize');
		const small = await resize(toImageData(image), {
			width,
			height,
			method: 'triangle',
			linearRGB: false
		});
		context.putImageData(small, 0, 0);
	}
	return canvas.convertToBlob({ type: 'image/png' });
}
