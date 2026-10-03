import { describe, expect, it } from 'vitest';
import { sniffFormat } from './sniff';

const bytes = (...values: (number | string)[]) =>
	new Uint8Array(
		values.flatMap((value) =>
			typeof value === 'string' ? [...value].map((char) => char.charCodeAt(0)) : [value]
		)
	);

/** En-tête ISO BMFF : taille de la boîte, `ftyp`, marque principale, version, marques compatibles. */
const ftyp = (major: string, ...compatible: string[]) => {
	const size = 16 + compatible.length * 4;
	return bytes(0, 0, 0, size, 'ftyp', major, 0, 0, 0, 0, ...compatible);
};

describe('sniffFormat', () => {
	it.each([
		['jpeg', bytes(0xff, 0xd8, 0xff, 0xe0)],
		['png', bytes(0x89, 'PNG', 0x0d, 0x0a, 0x1a, 0x0a)],
		['gif', bytes('GIF89a')],
		['gif', bytes('GIF87a')],
		['webp', bytes('RIFF', 0, 0, 0, 0, 'WEBP')],
		['tiff', bytes('II', 0x2a, 0)],
		['tiff', bytes('MM', 0, 0x2a)],
		['jxl', bytes(0xff, 0x0a)],
		['jxl', bytes(0, 0, 0, 0x0c, 'JXL ', 0x0d, 0x0a, 0x87, 0x0a)],
		['ico', bytes(0, 0, 1, 0, 1, 0)],
		['bmp', bytes('BM', ...new Array(12).fill(0))],
		['avif', ftyp('avif', 'mif1', 'miaf')],
		['avif', ftyp('mif1', 'avif')],
		['heic', ftyp('heic', 'mif1', 'heic')],
		['heic', ftyp('mif1', 'heic')],
		['heic', ftyp('heix')]
	] as const)('détecte %s', (expected, input) => {
		expect(sniffFormat(input)).toBe(expected);
	});

	it('détecte un SVG précédé d’une déclaration XML et de commentaires', () => {
		const svg = new TextEncoder().encode(
			'﻿<?xml version="1.0"?>\n<!-- logo -->\n<svg xmlns="http://www.w3.org/2000/svg"></svg>'
		);
		expect(sniffFormat(svg)).toBe('svg');
	});

	it('ignore les fichiers inconnus', () => {
		expect(sniffFormat(bytes('%PDF-1.7'))).toBeNull();
		expect(sniffFormat(new TextEncoder().encode('<html><body></body></html>'))).toBeNull();
		expect(sniffFormat(new Uint8Array())).toBeNull();
	});
});
