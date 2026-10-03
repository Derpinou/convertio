import { FORMATS, ICO_SIZES, type FormatId } from '$lib/formats';
import { encodeBmp } from './encoders/bmp';
import { encodeIco, type IcoEntry } from './encoders/ico';
import { toImageData } from './image-data';
import { flatten, hasTransparency, padToSquare } from './pixels';
import { ConvertError, type ConvertSettings, type RawImage } from './types';

export interface EncodedImage {
	blob: Blob;
	width: number;
	height: number;
}

type Encoder = (image: RawImage, settings: ConvertSettings) => Promise<EncodedImage>;

const MIME = (format: FormatId) => FORMATS[format].mime;

function result(bytes: BlobPart, format: FormatId, image: RawImage): EncodedImage {
	return {
		blob: new Blob([bytes], { type: MIME(format) }),
		width: image.width,
		height: image.height
	};
}

/**
 * PNG via OxiPNG : même au niveau 1, les fichiers sont 4 à 10 fois plus légers
 * qu'avec un encodeur PNG basique, pour un surcoût de temps raisonnable.
 */
async function encodePng(image: RawImage, maxCompression = false): Promise<ArrayBuffer> {
	const { default: optimise } = await import('@jsquash/oxipng/optimise.js');
	return optimise(toImageData(image), { level: maxCompression ? 3 : 1, optimiseAlpha: true });
}

async function encodeGif(image: RawImage): Promise<Uint8Array> {
	const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
	const alpha = hasTransparency(image);
	const format = alpha ? 'rgba4444' : 'rgb565';
	const palette = quantize(image.data, 256, { format, oneBitAlpha: alpha });
	const index = applyPalette(image.data, palette, format);
	const transparentIndex = alpha ? palette.findIndex((color) => color[3] === 0) : -1;
	const gif = GIFEncoder();
	gif.writeFrame(index, image.width, image.height, {
		palette,
		transparent: transparentIndex >= 0,
		transparentIndex: Math.max(0, transparentIndex)
	});
	gif.finish();
	return gif.bytes();
}

/** Tailles retenues : celles qui ne nécessitent pas d'agrandir l'image, sinon la plus petite demandée. */
export function pickIcoSizes(requested: number[], width: number, height: number): number[] {
	const valid = requested.filter((size) => (ICO_SIZES as readonly number[]).includes(size));
	const sizes = valid.length ? valid : [16, 32, 48];
	const maxSide = Math.max(width, height);
	const fitting = sizes.filter((size) => size <= maxSide);
	return (fitting.length ? fitting : [Math.min(...sizes)]).sort((a, b) => a - b);
}

async function encodeIcoImage(image: RawImage, settings: ConvertSettings): Promise<EncodedImage> {
	const { default: resize } = await import('@jsquash/resize');
	const sizes = pickIcoSizes(settings.icoSizes, image.width, image.height);
	const maxSide = Math.max(image.width, image.height);
	const entries: IcoEntry[] = [];
	for (const size of sizes) {
		const scale = size / maxSide;
		const width = Math.max(1, Math.round(image.width * scale));
		const height = Math.max(1, Math.round(image.height * scale));
		const resized =
			width === image.width && height === image.height
				? image
				: await resize(toImageData(image), { width, height, method: 'lanczos3' });
		const png = await encodePng(padToSquare(resized, size));
		entries.push({ size, png: new Uint8Array(png) });
	}
	const largest = sizes[sizes.length - 1];
	return {
		blob: new Blob([encodeIco(entries) as Uint8Array<ArrayBuffer>], { type: MIME('ico') }),
		width: largest,
		height: largest
	};
}

const ENCODERS: Partial<Record<FormatId, Encoder>> = {
	jpeg: async (image, { quality }) => {
		const { default: encode } = await import('@jsquash/jpeg/encode.js');
		return result(await encode(toImageData(image), { quality }), 'jpeg', image);
	},
	png: async (image, { pngOptimize }) => result(await encodePng(image, pngOptimize), 'png', image),
	webp: async (image, { quality, lossless }) => {
		const { default: encode } = await import('@jsquash/webp/encode.js');
		const options = lossless ? { lossless: 1 } : { quality };
		return result(await encode(toImageData(image), options), 'webp', image);
	},
	avif: async (image, { quality, lossless }) => {
		const { default: encode } = await import('@jsquash/avif/encode.js');
		return result(await encode(toImageData(image), { quality, lossless, speed: 6 }), 'avif', image);
	},
	jxl: async (image, { quality, lossless }) => {
		const { default: encode } = await import('@jsquash/jxl/encode.js');
		return result(await encode(toImageData(image), { quality, lossless, effort: 7 }), 'jxl', image);
	},
	gif: async (image) => result((await encodeGif(image)) as Uint8Array<ArrayBuffer>, 'gif', image),
	bmp: async (image) => result(encodeBmp(image) as Uint8Array<ArrayBuffer>, 'bmp', image),
	ico: encodeIcoImage,
	tiff: async (image) => {
		const { default: UTIF } = await import('utif');
		return result(UTIF.encodeImage(image.data, image.width, image.height), 'tiff', image);
	}
};

/** Prépare les pixels pour le format cible (fond uni si le format ne gère pas la transparence). */
export function prepare(image: RawImage, settings: ConvertSettings): RawImage {
	return FORMATS[settings.format].alpha ? image : flatten(image, settings.background);
}

export async function encode(image: RawImage, settings: ConvertSettings): Promise<EncodedImage> {
	const encoder = ENCODERS[settings.format];
	if (!encoder) throw new ConvertError('unsupported-output');
	try {
		return await encoder(image, settings);
	} catch (error) {
		if (error instanceof ConvertError || error instanceof RangeError) throw error;
		console.error(error);
		throw new ConvertError('encode-failed');
	}
}
