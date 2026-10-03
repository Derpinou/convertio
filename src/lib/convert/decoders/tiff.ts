import UTIF from 'utif';
import { ConvertError, type RawImage } from '../types';

/** Décode la plus grande image d'un fichier TIFF (les autres pages sont souvent des vignettes). */
export function decodeTiff(buffer: ArrayBuffer): RawImage {
	const ifds = UTIF.decode(buffer);
	const area = (ifd: (typeof ifds)[number]) => (ifd.t256?.[0] ?? 0) * (ifd.t257?.[0] ?? 0);
	const page = ifds.reduce<(typeof ifds)[number] | undefined>(
		(best, ifd) => (!best || area(ifd) > area(best) ? ifd : best),
		undefined
	);
	if (!page || !area(page)) throw new ConvertError('decode-failed');

	UTIF.decodeImage(buffer, page, ifds);
	const rgba = UTIF.toRGBA8(page);
	if (!page.width || !page.height || rgba.length !== page.width * page.height * 4) {
		throw new ConvertError('decode-failed');
	}
	return {
		data: new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.length),
		width: page.width,
		height: page.height
	};
}
