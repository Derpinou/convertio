import { describe, expect, it } from 'vitest';
import {
	ACCEPT,
	dedupeNames,
	formatBytes,
	formatFromMime,
	formatFromName,
	FORMATS,
	OUTPUT_FORMATS,
	outputFileName
} from './formats';

describe('formats', () => {
	it('reconnaît les extensions, sans tenir compte de la casse', () => {
		expect(formatFromName('IMG_0001.HEIC')).toBe('heic');
		expect(formatFromName('photo.jpeg')).toBe('jpeg');
		expect(formatFromName('scan.tif')).toBe('tiff');
		expect(formatFromName('archive.zip')).toBeNull();
		expect(formatFromName('sans-extension')).toBeNull();
	});

	it('reconnaît les types MIME et leurs alias', () => {
		expect(formatFromMime('image/jpg')).toBe('jpeg');
		expect(formatFromMime('image/heif')).toBe('heic');
		expect(formatFromMime('image/svg+xml; charset=utf-8')).toBe('svg');
		expect(formatFromMime('')).toBeNull();
	});

	it('renomme le fichier avec l’extension du format cible', () => {
		expect(outputFileName('vacances.HEIC', 'jpeg')).toBe('vacances.jpg');
		expect(outputFileName('mon.logo.svg', 'png')).toBe('mon.logo.png');
		expect(outputFileName('.png', 'webp')).toBe('.png.webp');
		expect(outputFileName('image', 'avif')).toBe('image.avif');
	});

	it('rend les noms uniques pour une archive', () => {
		expect(dedupeNames(['a.jpg', 'b.jpg', 'A.jpg', 'a.jpg', 'c'])).toEqual([
			'a.jpg',
			'b.jpg',
			'A (2).jpg',
			'a (3).jpg',
			'c'
		]);
	});

	it('formate les tailles en français', () => {
		expect(formatBytes(512)).toBe('512 o');
		expect(formatBytes(1536)).toBe('1,5 Ko');
		expect(formatBytes(20 * 1024 * 1024)).toBe('20 Mo');
	});

	it('ne propose en sortie que des formats encodables', () => {
		for (const id of OUTPUT_FORMATS) expect(FORMATS[id].output).toBe(true);
		expect(OUTPUT_FORMATS).not.toContain('heic');
		expect(OUTPUT_FORMATS).not.toContain('svg');
	});

	it('accepte les extensions qui n’ont pas de type MIME fiable', () => {
		expect(ACCEPT).toContain('.heic');
		expect(ACCEPT).toContain('.jxl');
		expect(ACCEPT.startsWith('image/*')).toBe(true);
	});
});
