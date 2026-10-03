<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { takeSharedFiles } from '$lib/files';
	import type { FormatId } from '$lib/formats';
	import { converter } from '$lib/state/converter.svelte';
	import ConvertOptions from './ConvertOptions.svelte';
	import DropZone from './DropZone.svelte';
	import FileList from './FileList.svelte';
	import FormatPicker from './FormatPicker.svelte';

	/** Format de sortie présélectionné (pages « HEIC en JPG »…). */
	let { target }: { target?: FormatId } = $props();

	const addFiles = (files: File[]) => converter.add(files);

	onMount(() => {
		converter.restorePreferences();

		// Fichiers reçus via « Partager vers Convertio » (déposés par le service worker).
		void takeSharedFiles().then((files) => files.length && addFiles(files));

		// Fichiers ouverts via « Ouvrir avec Convertio » (File Handling API, Chromium).
		window.launchQueue?.setConsumer(async ({ files }) => {
			addFiles(await Promise.all(files.map((handle) => handle.getFile())));
		});
	});

	// Appliqué au montage et à chaque navigation vers une autre page de conversion.
	$effect(() => {
		const format = target;
		if (!format) return;
		untrack(() => {
			converter.restorePreferences();
			converter.prefs.format = format;
		});
	});
</script>

<div class="space-y-6">
	<section
		aria-label="Réglages de conversion"
		class="space-y-6 rounded-lg bg-white p-4 shadow-xs outline-1 outline-gray-900/5 sm:p-6 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
	>
		<FormatPicker />
		<div class="border-t border-gray-200 pt-6 dark:border-white/10">
			<ConvertOptions />
		</div>
	</section>

	<DropZone onfiles={addFiles} />

	{#if converter.items.length}
		<FileList />
	{/if}
</div>
