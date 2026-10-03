import { describe, expect, it } from 'vitest';
import { fitWithin, flatten, hasTransparency, padToSquare, parseHexColor } from './pixels';

const image = (pixels: number[][], width: number) => ({
	data: new Uint8ClampedArray(pixels.flat()),
	width,
	height: pixels.length / width
});

describe('pixels', () => {
	it('détecte la transparence', () => {
		expect(hasTransparency(image([[1, 2, 3, 255]], 1))).toBe(false);
		expect(
			hasTransparency(
				image(
					[
						[1, 2, 3, 255],
						[0, 0, 0, 254]
					],
					2
				)
			)
		).toBe(true);
	});

	it('lit les couleurs hexadécimales, blanc par défaut', () => {
		expect(parseHexColor('#ff8000')).toEqual([255, 128, 0]);
		expect(parseHexColor('00FF00')).toEqual([0, 255, 0]);
		expect(parseHexColor('rouge')).toEqual([255, 255, 255]);
	});

	it('compose l’image sur un fond uni', () => {
		const src = image(
			[
				[255, 0, 0, 255], // opaque : inchangé
				[255, 0, 0, 0], // transparent : couleur de fond
				[255, 0, 0, 128] // semi-transparent : mélange
			],
			3
		);
		const out = flatten(src, '#0000ff');
		expect([...out.data]).toEqual([255, 0, 0, 255, 0, 0, 255, 255, 128, 0, 127, 255]);
	});

	it('ne copie pas une image déjà opaque', () => {
		const src = image([[1, 2, 3, 255]], 1);
		expect(flatten(src, '#000000')).toBe(src);
	});

	it('calcule des dimensions qui tiennent dans un carré sans agrandir', () => {
		expect(fitWithin(4000, 3000, 192)).toEqual([192, 144]);
		expect(fitWithin(100, 50, 192)).toEqual([100, 50]);
		expect(fitWithin(10000, 1, 192)).toEqual([192, 1]);
	});

	it('centre l’image dans un carré transparent', () => {
		const out = padToSquare(
			image(
				[
					[9, 9, 9, 255],
					[8, 8, 8, 255]
				],
				2
			),
			4
		);
		expect(out.width).toBe(4);
		expect(out.height).toBe(4);
		// 2×1 centré dans 4×4 : ligne 1, colonnes 1 et 2.
		const at = (x: number, y: number) => [
			...out.data.subarray((y * 4 + x) * 4, (y * 4 + x) * 4 + 4)
		];
		expect(at(1, 1)).toEqual([9, 9, 9, 255]);
		expect(at(2, 1)).toEqual([8, 8, 8, 255]);
		expect(at(0, 0)).toEqual([0, 0, 0, 0]);
	});
});
