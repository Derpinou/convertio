import { ConvertError, type RawImage } from './types';

/** Taille utilisée quand le SVG n'indique ni dimensions ni viewBox. */
export const SVG_FALLBACK_SIZE = 512;

const UNIT_TO_PX: Record<string, number> = {
	'': 1,
	px: 1,
	pt: 4 / 3,
	pc: 16,
	mm: 96 / 25.4,
	cm: 96 / 2.54,
	in: 96,
	em: 16,
	rem: 16,
	ex: 8
};

/** Convertit une longueur SVG (`120`, `12pt`, `3cm`…) en pixels ; `null` pour `%`, `auto`, etc. */
export function parseSvgLength(value: string | null): number | null {
	if (!value) return null;
	const match = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i.exec(value);
	if (!match) return null;
	const factor = UNIT_TO_PX[match[2].toLowerCase()];
	if (factor === undefined) return null;
	const px = parseFloat(match[1]) * factor;
	return px > 0 && Number.isFinite(px) ? px : null;
}

export interface SvgRenderSize {
	width: number;
	height: number;
	/** viewBox à ajouter quand le SVG n'en a pas (indispensable pour qu'il se redimensionne). */
	viewBox: string | null;
}

/**
 * Calcule la taille de rendu d'un SVG à partir de ses attributs.
 * `target` : longueur du côté le plus long souhaitée (ou `null` pour la taille intrinsèque).
 */
export function computeSvgSize(
	widthAttr: string | null,
	heightAttr: string | null,
	viewBoxAttr: string | null,
	target: number | null
): SvgRenderSize {
	let width = parseSvgLength(widthAttr);
	let height = parseSvgLength(heightAttr);
	const viewBox = viewBoxAttr
		?.trim()
		.split(/[\s,]+/)
		.map(Number)
		.filter((n) => Number.isFinite(n));
	const hasViewBox = viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0;

	if (hasViewBox) {
		const ratio = viewBox[2] / viewBox[3];
		if (!width && !height) {
			width = viewBox[2];
			height = viewBox[3];
		} else if (!width) {
			width = height! * ratio;
		} else if (!height) {
			height = width / ratio;
		}
	}
	if (!width || !height) {
		width = width ?? height ?? SVG_FALLBACK_SIZE;
		height = height ?? width;
	}

	const intrinsicWidth = width;
	const intrinsicHeight = height;
	if (target) {
		const scale = target / Math.max(width, height);
		width *= scale;
		height *= scale;
	}
	return {
		width: Math.max(1, Math.round(width)),
		height: Math.max(1, Math.round(height)),
		viewBox: hasViewBox ? null : `0 0 ${intrinsicWidth} ${intrinsicHeight}`
	};
}

/** Rastérise un SVG (dans le thread principal : le rendu SVG nécessite le DOM). */
export async function rasterizeSvg(
	file: Blob,
	target: number | null,
	maxCanvasPixels: number
): Promise<RawImage> {
	const doc = new DOMParser().parseFromString(await file.text(), 'image/svg+xml');
	const svg = doc.documentElement;
	if (svg.localName !== 'svg' || doc.getElementsByTagName('parsererror').length) {
		throw new ConvertError('decode-failed');
	}

	const size = computeSvgSize(
		svg.getAttribute('width'),
		svg.getAttribute('height'),
		svg.getAttribute('viewBox'),
		target
	);
	if (size.width * size.height > maxCanvasPixels) throw new ConvertError('too-large');
	if (size.viewBox) svg.setAttribute('viewBox', size.viewBox);
	svg.setAttribute('width', String(size.width));
	svg.setAttribute('height', String(size.height));

	const url = URL.createObjectURL(
		new Blob([new XMLSerializer().serializeToString(doc)], { type: 'image/svg+xml' })
	);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		const canvas = document.createElement('canvas');
		canvas.width = size.width;
		canvas.height = size.height;
		const context = canvas.getContext('2d');
		if (!context) throw new ConvertError('too-large');
		context.drawImage(img, 0, 0, size.width, size.height);
		const { data, width, height } = context.getImageData(0, 0, size.width, size.height);
		return { data, width, height };
	} catch (error) {
		if (error instanceof ConvertError) throw error;
		throw new ConvertError('decode-failed');
	} finally {
		URL.revokeObjectURL(url);
	}
}
