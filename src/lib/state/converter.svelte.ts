import { convertImage, detectFormat } from '$lib/convert/client';
import { ConvertError, errorMessage, type ConvertSettings } from '$lib/convert/types';
import { outputFileName, type FormatId } from '$lib/formats';
import {
	defaultPreferences,
	loadPreferences,
	savePreferences,
	settingsKey,
	toConvertSettings,
	type Preferences
} from './preferences';

export type ItemStatus = 'pending' | 'converting' | 'done' | 'error';

export interface ConvertedOutput {
	blob: Blob;
	url: string;
	name: string;
	format: FormatId;
	width: number;
	height: number;
	thumbUrl?: string;
	settingsKey: string;
}

export interface QueueItem {
	id: string;
	file: File;
	name: string;
	size: number;
	sourceFormat: FormatId | null;
	status: ItemStatus;
	/** Incrémenté à chaque conversion : ignore les résultats d'une conversion devenue obsolète. */
	job: number;
	output?: ConvertedOutput;
	error?: string;
}

function revoke(output: ConvertedOutput | undefined) {
	if (!output) return;
	URL.revokeObjectURL(output.url);
	if (output.thumbUrl) URL.revokeObjectURL(output.thumbUrl);
}

class Converter {
	items = $state<QueueItem[]>([]);
	prefs = $state<Preferences>(defaultPreferences());
	settings = $derived<ConvertSettings>(toConvertSettings(this.prefs));

	done = $derived(this.items.filter((item) => item.status === 'done' && item.output));
	busy = $derived(
		this.items.some((item) => item.status === 'pending' || item.status === 'converting')
	);
	hasSvg = $derived(this.items.some((item) => item.sourceFormat === 'svg'));
	/** Fichiers convertis avec d'anciens réglages. */
	outdated = $derived(
		this.items.filter(
			(item) =>
				item.status === 'done' &&
				item.output?.settingsKey !== settingsKey(this.settings, item.sourceFormat)
		)
	);

	#restored = false;

	/**
	 * À appeler côté client : les réglages mémorisés ne sont pas connus au prérendu.
	 * Sans effet après le premier appel.
	 */
	restorePreferences() {
		if (this.#restored) return;
		this.#restored = true;
		this.prefs = loadPreferences();
		$effect.root(() => {
			$effect(() => savePreferences($state.snapshot(this.prefs)));
		});
	}

	add(files: Iterable<File>) {
		for (const file of files) {
			const id = crypto.randomUUID();
			this.items.push({
				id,
				file,
				name: file.name || 'image',
				size: file.size,
				sourceFormat: null,
				status: 'pending',
				job: 0
			});
			void this.#convert(id);
		}
	}

	remove(id: string) {
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) return;
		revoke(this.items[index].output);
		this.items.splice(index, 1);
	}

	clear() {
		for (const item of this.items) revoke(item.output);
		this.items = [];
	}

	retry(id: string) {
		void this.#convert(id);
	}

	reconvertOutdated() {
		for (const item of this.outdated) void this.#convert(item.id);
	}

	#find(id: string): QueueItem | undefined {
		return this.items.find((item) => item.id === id);
	}

	async #convert(id: string) {
		const item = this.#find(id);
		if (!item) return;
		const job = ++item.job;
		const settings = $state.snapshot(this.settings);
		const isCurrent = () => {
			const current = this.#find(id);
			return current && current.job === job ? current : undefined;
		};
		item.status = 'pending';
		item.error = undefined;

		try {
			item.sourceFormat ??= await detectFormat(item.file);
			const sourceFormat = item.sourceFormat;
			if (!sourceFormat) throw new ConvertError('unsupported-input');

			const result = await convertImage(item.file, sourceFormat, settings, () => {
				const current = isCurrent();
				if (current) current.status = 'converting';
			});

			const current = isCurrent();
			if (!current) return;
			revoke(current.output);
			current.output = {
				blob: result.blob,
				url: URL.createObjectURL(result.blob),
				name: outputFileName(current.name, settings.format),
				format: settings.format,
				width: result.width,
				height: result.height,
				thumbUrl: result.thumbnail ? URL.createObjectURL(result.thumbnail) : undefined,
				settingsKey: settingsKey(settings, sourceFormat)
			};
			current.status = 'done';
		} catch (error) {
			const current = isCurrent();
			if (!current) return;
			console.error(error);
			revoke(current.output);
			current.output = undefined;
			current.status = 'error';
			current.error = errorMessage(error);
		}
	}
}

export const converter = new Converter();
