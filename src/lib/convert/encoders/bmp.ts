import type { RawImage } from '../types';

const FILE_HEADER_SIZE = 14;
const INFO_HEADER_SIZE = 40;

/**
 * Encode un BMP 24 bits (BITMAPINFOHEADER), la variante la plus compatible.
 * L'image doit déjà être opaque (voir `flatten`).
 */
export function encodeBmp(image: RawImage): Uint8Array {
	const { width, height, data } = image;
	const rowSize = Math.ceil((width * 3) / 4) * 4;
	const pixelBytes = rowSize * height;
	const fileSize = FILE_HEADER_SIZE + INFO_HEADER_SIZE + pixelBytes;
	const out = new Uint8Array(fileSize);
	const view = new DataView(out.buffer);

	// BITMAPFILEHEADER
	out[0] = 0x42; // B
	out[1] = 0x4d; // M
	view.setUint32(2, fileSize, true);
	view.setUint32(10, FILE_HEADER_SIZE + INFO_HEADER_SIZE, true);

	// BITMAPINFOHEADER
	view.setUint32(14, INFO_HEADER_SIZE, true);
	view.setInt32(18, width, true);
	view.setInt32(22, height, true); // positif : lignes stockées de bas en haut
	view.setUint16(26, 1, true); // plans
	view.setUint16(28, 24, true); // bits par pixel
	view.setUint32(30, 0, true); // BI_RGB, sans compression
	view.setUint32(34, pixelBytes, true);
	view.setInt32(38, 2835, true); // 72 dpi
	view.setInt32(42, 2835, true);

	let offset = FILE_HEADER_SIZE + INFO_HEADER_SIZE;
	for (let y = height - 1; y >= 0; y--) {
		let src = y * width * 4;
		for (let x = 0; x < width; x++, src += 4) {
			out[offset + x * 3] = data[src + 2];
			out[offset + x * 3 + 1] = data[src + 1];
			out[offset + x * 3 + 2] = data[src];
		}
		offset += rowSize;
	}
	return out;
}
