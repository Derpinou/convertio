// Déclarations minimales pour les dépendances sans types.

declare module 'gifenc' {
	export type Palette = number[][];
	export type ColorFormat = 'rgb565' | 'rgb444' | 'rgba4444';

	export function quantize(
		rgba: Uint8Array | Uint8ClampedArray,
		maxColors: number,
		options?: { format?: ColorFormat; oneBitAlpha?: boolean | number; clearAlpha?: boolean }
	): Palette;

	export function applyPalette(
		rgba: Uint8Array | Uint8ClampedArray,
		palette: Palette,
		format?: ColorFormat
	): Uint8Array;

	export interface Encoder {
		writeFrame(
			index: Uint8Array,
			width: number,
			height: number,
			options?: {
				palette?: Palette;
				transparent?: boolean;
				transparentIndex?: number;
				delay?: number;
				repeat?: number;
			}
		): void;
		finish(): void;
		bytes(): Uint8Array;
	}

	export function GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): Encoder;
}

declare module 'utif' {
	export interface IFD {
		width: number;
		height: number;
		t256?: number[];
		t257?: number[];
		[tag: string]: unknown;
	}

	const UTIF: {
		decode(buffer: ArrayBuffer): IFD[];
		decodeImage(buffer: ArrayBuffer, ifd: IFD, ifds?: IFD[]): void;
		toRGBA8(ifd: IFD): Uint8Array;
		encodeImage(
			rgba: ArrayLike<number> | ArrayBuffer,
			width: number,
			height: number,
			metadata?: Record<string, unknown>
		): ArrayBuffer;
	};
	export default UTIF;
}

declare module 'libheif-js/libheif-wasm/libheif.js' {
	export interface HeifImage {
		get_width(): number;
		get_height(): number;
		is_primary(): boolean;
		display(
			target: { data: Uint8ClampedArray; width: number; height: number },
			callback: (result: unknown) => void
		): void;
		free(): void;
	}

	export interface LibHeif {
		HeifDecoder: new () => { decode(data: Uint8Array): HeifImage[] };
	}

	const factory: (options: {
		wasmBinary?: ArrayBuffer;
		onRuntimeInitialized?: () => void;
		onAbort?: (reason: unknown) => void;
	}) => LibHeif;
	export default factory;
}
