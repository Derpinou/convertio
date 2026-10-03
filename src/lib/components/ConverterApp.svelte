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

<!--
	Grand écran : réglages à gauche, fichiers à droite. Sans fichier, la zone de dépôt prend la
	hauteur de la carte de réglages ; avec des fichiers, la carte reste visible au défilement.
-->
<div
	class={[
		'grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
		converter.items.length ? 'lg:items-start' : 'lg:items-stretch'
	]}
>
	<section
		aria-label="Réglages de conversion"
		class="space-y-6 rounded-lg bg-white p-4 shadow-xs outline-1 outline-gray-900/5 sm:p-6 lg:sticky lg:top-6 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
	>
		<FormatPicker />
		<div class="border-t border-gray-200 pt-6 dark:border-white/10">
			<ConvertOptions />
		</div>
	</section>

	<div class="flex min-w-0 flex-col gap-6">
		<DropZone onfiles={addFiles} expanded={!converter.items.length} />

		{#if converter.items.length}
			<FileList />
		{/if}
	</div>
</div>
