import { describe, expect, it } from 'vitest';
import { computeSvgSize, parseSvgLength, SVG_FALLBACK_SIZE } from './svg';

describe('parseSvgLength', () => {
	it('convertit les unités en pixels', () => {
		expect(parseSvgLength('120')).toBe(120);
		expect(parseSvgLength('24px')).toBe(24);
		expect(parseSvgLength('1in')).toBe(96);
		expect(parseSvgLength('12pt')).toBe(16);
		expect(parseSvgLength(' 2.54cm ')).toBeCloseTo(96);
	});

	it('refuse les valeurs relatives ou invalides', () => {
		expect(parseSvgLength('100%')).toBeNull();
		expect(parseSvgLength('auto')).toBeNull();
		expect(parseSvgLength('0')).toBeNull();
		expect(parseSvgLength(null)).toBeNull();
	});
});

describe('computeSvgSize', () => {
	it('utilise width et height quand ils sont fournis', () => {
		expect(computeSvgSize('64', '32', '0 0 640 320', null)).toEqual({
			width: 64,
			height: 32,
			viewBox: null
		});
	});

	it('déduit la taille du viewBox', () => {
		expect(computeSvgSize(null, null, '0 0 300 150', null)).toMatchObject({
			width: 300,
			height: 150
		});
		expect(computeSvgSize('600', null, '0 0 300 150', null)).toMatchObject({
			width: 600,
			height: 300
		});
	});

	it('redimensionne selon le côté le plus long', () => {
		expect(computeSvgSize('24', '12', '0 0 24 12', 1024)).toEqual({
			width: 1024,
			height: 512,
			viewBox: null
		});
	});

	it('ajoute un viewBox quand il manque, pour que le dessin suive le redimensionnement', () => {
		expect(computeSvgSize('24', '24', null, 512)).toEqual({
			width: 512,
			height: 512,
			viewBox: '0 0 24 24'
		});
	});

	it('utilise une taille par défaut sans aucune information', () => {
		expect(computeSvgSize('100%', null, null, null)).toEqual({
			width: SVG_FALLBACK_SIZE,
			height: SVG_FALLBACK_SIZE,
			viewBox: `0 0 ${SVG_FALLBACK_SIZE} ${SVG_FALLBACK_SIZE}`
		});
	});
});
