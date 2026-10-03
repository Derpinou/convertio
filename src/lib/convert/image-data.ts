import type { RawImage } from './types';

/**
 * Convertit en véritable `ImageData` (attendu par les codecs jSquash), en garantissant
 * un tampon dédié : certains codecs lisent `data.buffer` en entier.
 */
export function toImageData(image: RawImage): ImageData {
	let { data } = image;
	if (data.byteOffset !== 0 || data.byteLength !== data.buffer.byteLength) {
		data = data.slice();
	}
	if (image instanceof ImageData && data === image.data) return image;
	return new ImageData(data as Uint8ClampedArray<ArrayBuffer>, image.width, image.height);
}
