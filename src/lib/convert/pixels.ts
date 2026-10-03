import type { RawImage } from './types';

/** Au-delà, on refuse l'image : son décodage saturerait la mémoire de la plupart des appareils. */
export const MAX_PIXELS = 150_000_000;

export function hasTransparency(image: RawImage): boolean {
	const { data } = image;
	for (let i = 3; i < data.length; i += 4) {
		if (data[i] !== 255) return true;
	}
	return false;
}

export function parseHexColor(hex: string): [number, number, number] {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
	if (!match) return [255, 255, 255];
	const value = parseInt(match[1], 16);
	return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** Compose l'image sur un fond uni (pour les formats sans transparence). */
export function flatten(image: RawImage, background: string): RawImage {
	if (!hasTransparency(image)) return image;
	const [br, bg, bb] = parseHexColor(background);
	const src = image.data;
	const out = new Uint8ClampedArray(src.length);
	for (let i = 0; i < src.length; i += 4) {
		const a = src[i + 3] / 255;
		out[i] = src[i] * a + br * (1 - a);
		out[i + 1] = src[i + 1] * a + bg * (1 - a);
		out[i + 2] = src[i + 2] * a + bb * (1 - a);
		out[i + 3] = 255;
	}
	return { data: out, width: image.width, height: image.height };
}

/** Dimensions qui tiennent dans `max × max` en gardant les proportions. */
export function fitWithin(width: number, height: number, max: number): [number, number] {
	const scale = Math.min(1, max / Math.max(width, height));
	return [Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale))];
}

/** Centre l'image dans un carré transparent `size × size` (l'image doit déjà tenir dedans). */
export function padToSquare(image: RawImage, size: number): RawImage {
	if (image.width === size && image.height === size) return image;
	const out = new Uint8ClampedArray(size * size * 4);
	const left = Math.floor((size - image.width) / 2);
	const top = Math.floor((size - image.height) / 2);
	for (let y = 0; y < image.height; y++) {
		const srcStart = y * image.width * 4;
		out.set(
			image.data.subarray(srcStart, srcStart + image.width * 4),
			((top + y) * size + left) * 4
		);
	}
	return { data: out, width: size, height: size };
}
