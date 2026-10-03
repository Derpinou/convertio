export interface IcoEntry {
	size: number;
	/** Image PNG de `size × size` pixels. */
	png: Uint8Array;
}

const HEADER_SIZE = 6;
const ENTRY_SIZE = 16;

/** Assemble un fichier ICO dont chaque taille est stockée en PNG (pris en charge depuis Windows Vista). */
export function encodeIco(entries: IcoEntry[]): Uint8Array {
	const sorted = [...entries].sort((a, b) => a.size - b.size);
	const dataSize = sorted.reduce((sum, entry) => sum + entry.png.length, 0);
	const out = new Uint8Array(HEADER_SIZE + ENTRY_SIZE * sorted.length + dataSize);
	const view = new DataView(out.buffer);

	view.setUint16(0, 0, true); // réservé
	view.setUint16(2, 1, true); // type : icône
	view.setUint16(4, sorted.length, true);

	let offset = HEADER_SIZE + ENTRY_SIZE * sorted.length;
	sorted.forEach((entry, i) => {
		const pos = HEADER_SIZE + ENTRY_SIZE * i;
		out[pos] = entry.size >= 256 ? 0 : entry.size; // 0 signifie 256
		out[pos + 1] = entry.size >= 256 ? 0 : entry.size;
		out[pos + 2] = 0; // palette
		out[pos + 3] = 0; // réservé
		view.setUint16(pos + 4, 1, true); // plans
		view.setUint16(pos + 6, 32, true); // bits par pixel
		view.setUint32(pos + 8, entry.png.length, true);
		view.setUint32(pos + 12, offset, true);
		out.set(entry.png, offset);
		offset += entry.png.length;
	});
	return out;
}
