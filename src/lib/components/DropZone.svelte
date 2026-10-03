<script lang="ts">
	import { ACCEPT } from '$lib/formats';
	import Icon from './Icon.svelte';

	let {
		onfiles,
		expanded = false
	}: {
		onfiles: (files: File[]) => void;
		/** Remplit la hauteur de sa colonne (grand écran, aucun fichier encore). */
		expanded?: boolean;
	} = $props();

	let input: HTMLInputElement;
	let dragging = $state(false);
	let dragDepth = 0;

	function hasFiles(event: DragEvent) {
		return event.dataTransfer?.types.includes('Files') ?? false;
	}

	function emit(list: FileList | null | undefined) {
		const files = list ? Array.from(list) : [];
		if (files.length) onfiles(files);
	}

	function onDragEnter(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		dragDepth++;
		dragging = true;
	}

	function onDragOver(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	}

	function onDragLeave(event: DragEvent) {
		if (!hasFiles(event)) return;
		dragDepth = Math.max(0, dragDepth - 1);
		if (dragDepth === 0) dragging = false;
	}

	function onDrop(event: DragEvent) {
		if (!hasFiles(event)) return;
		event.preventDefault();
		dragDepth = 0;
		dragging = false;
		emit(event.dataTransfer?.files);
	}

	function onPaste(event: ClipboardEvent) {
		const target = event.target as HTMLElement | null;
		if (target?.closest('input, textarea, [contenteditable]')) return;
		const files = Array.from(event.clipboardData?.files ?? []);
		if (files.length) {
			event.preventDefault();
			onfiles(files);
		}
	}
</script>

<svelte:window
	ondragenter={onDragEnter}
	ondragover={onDragOver}
	ondragleave={onDragLeave}
	ondrop={onDrop}
	onpaste={onPaste}
/>

<label
	for="file-upload"
	class={[
		'group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-10 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/40 sm:py-14 dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-indigo-400 dark:hover:bg-indigo-500/5',
		expanded && 'lg:flex-1'
	]}
>
	<div class="text-center">
		<Icon
			name="photo"
			class="mx-auto size-12 text-gray-300 transition-colors group-hover:text-indigo-400 dark:text-gray-600"
		/>
		<p class="mt-4 text-sm/6 text-gray-600 dark:text-gray-400">
			<span class="font-semibold text-indigo-600 group-hover:text-indigo-500 dark:text-indigo-400">
				Choisissez des images
			</span>
			<span class="pointer-coarse:hidden">ou glissez-déposez-les ici</span>
		</p>
		<p class="mt-1 text-xs/5 text-gray-500">
			HEIC, JPEG, PNG, WebP, AVIF, GIF, SVG, TIFF, BMP, ICO, JPEG XL
			<span class="pointer-coarse:hidden">· Ctrl+V pour coller</span>
		</p>
		<input
			bind:this={input}
			id="file-upload"
			name="file-upload"
			type="file"
			multiple
			accept={ACCEPT}
			class="sr-only"
			onchange={() => {
				emit(input.files);
				input.value = '';
			}}
		/>
	</div>
</label>

{#if dragging}
	<div
		class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-indigo-600/10 p-6 backdrop-blur-sm dark:bg-indigo-500/10"
	>
		<div
			class="flex w-full max-w-lg flex-col items-center rounded-2xl border-2 border-dashed border-indigo-500 bg-white/90 px-6 py-14 text-center shadow-xl dark:bg-gray-900/90"
		>
			<Icon name="arrow-down-tray" class="size-10 text-indigo-600 dark:text-indigo-400" />
			<p class="mt-4 text-base font-semibold text-gray-900 dark:text-white">
				Déposez vos images pour les convertir
			</p>
		</div>
	</div>
{/if}
