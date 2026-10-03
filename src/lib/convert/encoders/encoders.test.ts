import { describe, expect, it } from 'vitest';
import { pickIcoSizes } from '../encode';
import { encodeBmp } from './bmp';
import { encodeIco } from './ico';

describe('encodeBmp', () => {
	it('écrit un BMP 24 bits, lignes de bas en haut, alignées sur 4 octets', () => {
		// 3 × 2 pixels : ligne du haut rouge, ligne du bas bleue.
		const data = new Uint8ClampedArray([
			255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 255
		]);
		const bmp = encodeBmp({ data, width: 3, height: 2 });
		const view = new DataView(bmp.buffer);
		const rowSize = 12; // 3 px × 3 octets = 9, arrondi à 12

		expect(String.fromCharCode(bmp[0], bmp[1])).toBe('BM');
		expect(view.getUint32(2, true)).toBe(bmp.length);
		expect(bmp.length).toBe(54 + rowSize * 2);
		expect(view.getInt32(18, true)).toBe(3);
		expect(view.getInt32(22, true)).toBe(2);
		expect(view.getUint16(28, true)).toBe(24);
		// Première ligne stockée = ligne du bas (bleue), en BGR.
		expect([...bmp.subarray(54, 57)]).toEqual([255, 0, 0]);
		expect([...bmp.subarray(54 + rowSize, 57 + rowSize)]).toEqual([0, 0, 255]);
	});
});

describe('encodeIco', () => {
	it('assemble les entrées PNG triées par taille', () => {
		const png16 = new Uint8Array([1, 2, 3]);
		const png256 = new Uint8Array([4, 5, 6, 7]);
		const ico = encodeIco([
			{ size: 256, png: png256 },
			{ size: 16, png: png16 }
		]);
		const view = new DataView(ico.buffer);

		expect(view.getUint16(2, true)).toBe(1); // type icône
		expect(view.getUint16(4, true)).toBe(2); // nombre d'images
		expect(ico[6]).toBe(16); // première entrée : 16 px
		expect(ico[6 + 16]).toBe(0); // 256 px est codé 0
		const firstOffset = view.getUint32(6 + 12, true);
		expect(firstOffset).toBe(6 + 16 * 2);
		expect([...ico.subarray(firstOffset, firstOffset + 3)]).toEqual([1, 2, 3]);
		expect(view.getUint32(6 + 16 + 8, true)).toBe(4);
	});
});

describe('pickIcoSizes', () => {
	it('ignore les tailles plus grandes que l’image', () => {
		expect(pickIcoSizes([16, 32, 48, 256], 100, 64)).toEqual([16, 32, 48]);
	});

	it('garde la plus petite taille demandée pour une image minuscule', () => {
		expect(pickIcoSizes([32, 16], 8, 8)).toEqual([16]);
	});

	it('utilise des tailles par défaut si la sélection est invalide', () => {
		expect(pickIcoSizes([999], 512, 512)).toEqual([16, 32, 48]);
	});
});
