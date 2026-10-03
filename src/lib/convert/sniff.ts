import type { FormatId } from '$lib/formats';

/** Nombre d'octets à lire en tête de fichier pour détecter son format. */
export const SNIFF_BYTES = 1024;

const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

function ascii(bytes: Uint8Array, start: number, length: number): string {
	let out = '';
	for (let i = start; i < start + length && i < bytes.length; i++) {
		out += String.fromCharCode(bytes[i]);
	}
	return out;
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
	if (bytes.length < offset + signature.length) return false;
	return signature.every((byte, i) => bytes[offset + i] === byte);
}

/** Conteneurs ISO BMFF (HEIC, AVIF) : on lit la marque principale et les marques compatibles. */
function sniffIsoBmff(bytes: Uint8Array): FormatId | null {
	if (ascii(bytes, 4, 4) !== 'ftyp') return null;
	const boxSize = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
	const end = Math.min(boxSize || bytes.length, bytes.length);
	const brands = [ascii(bytes, 8, 4)];
	for (let offset = 16; offset + 4 <= end; offset += 4) {
		brands.push(ascii(bytes, offset, 4));
	}
	if (brands.some((brand) => AVIF_BRANDS.has(brand))) return 'avif';
	if (brands.some((brand) => HEIC_BRANDS.has(brand))) return 'heic';
	// `mif1` / `msf1` seuls : conteneur HEIF générique, le plus souvent du HEIC.
	if (brands.includes('mif1') || brands.includes('msf1')) return 'heic';
	return null;
}

function sniffSvg(bytes: Uint8Array): boolean {
	let text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
	text = text.replace(/^﻿/, '').trimStart();
	if (!text.startsWith('<')) return false;
	// Retire déclaration XML, commentaires et DOCTYPE avant la racine.
	text = text.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
	return /<svg[\s>]/i.test(text);
}

/** Détecte le format d'une image à partir de ses premiers octets (« magic bytes »). */
export function sniffFormat(bytes: Uint8Array): FormatId | null {
	if (startsWith(bytes, [0xff, 0xd8, 0xff])) return 'jpeg';
	if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
	if (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a') return 'gif';
	if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
	if (startsWith(bytes, [0x49, 0x49, 0x2a, 0x00]) || startsWith(bytes, [0x4d, 0x4d, 0x00, 0x2a])) {
		return 'tiff';
	}
	if (startsWith(bytes, [0xff, 0x0a])) return 'jxl';
	if (startsWith(bytes, [0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a])) {
		return 'jxl';
	}
	if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00]) || startsWith(bytes, [0x00, 0x00, 0x02, 0x00])) {
		return 'ico';
	}
	if (ascii(bytes, 0, 2) === 'BM' && bytes.length >= 14) return 'bmp';
	const iso = sniffIsoBmff(bytes);
	if (iso) return iso;
	if (sniffSvg(bytes)) return 'svg';
	return null;
}
