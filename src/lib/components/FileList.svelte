<script lang="ts">
	import { formatBytes } from '$lib/formats';
	import { saveAsZip, saveBlob } from '$lib/files';
	import { converter } from '$lib/state/converter.svelte';
	import { toasts } from '$lib/state/toasts.svelte';
	import FileItem from './FileItem.svelte';
	import Icon from './Icon.svelte';

	let zipping = $state(false);

	const outdatedIds = $derived(new Set(converter.outdated.map((item) => item.id)));
	const totals = $derived(
		converter.done.reduce(
			(sum, item) => ({
				before: sum.before + item.size,
				after: sum.after + (item.output?.blob.size ?? 0)
			}),
			{ before: 0, after: 0 }
		)
	);

	async function downloadAll() {
		const files = converter.done.flatMap((item) =>
			item.output ? [{ name: item.output.name, blob: item.output.blob }] : []
		);
		if (files.length === 1) {
			saveBlob(files[0].blob, files[0].name);
			return;
		}
		zipping = true;
		try {
			await saveAsZip(files);
		} catch (error) {
			console.error(error);
			toasts.push({ kind: 'error', title: 'Impossible de créer l’archive ZIP' });
		} finally {
			zipping = false;
		}
	}
</script>

<section
	aria-labelledby="files-heading"
	class="overflow-hidden rounded-lg bg-white shadow-xs outline-1 outline-gray-900/5 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
>
	<div
		class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-gray-200 px-4 py-4 sm:px-6 dark:border-white/10"
	>
		<div>
			<h2 id="files-heading" class="text-base font-semibold text-gray-900 dark:text-white">
				Fichiers <span class="text-gray-400">({converter.items.length})</span>
			</h2>
			{#if totals.before > 0}
				<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
					{formatBytes(totals.before)} → {formatBytes(totals.after)}
				</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-2">
			{#if converter.outdated.length}
				<button
					type="button"
					onclick={() => converter.reconvertOutdated()}
					class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 shadow-xs hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:shadow-none dark:hover:bg-indigo-500/30"
				>
					<Icon name="arrow-path-solid" class="size-4" />
					Appliquer les réglages ({converter.outdated.length})
				</button>
			{/if}
			<button
				type="button"
				onclick={() => converter.clear()}
				class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
			>
				Vider
			</button>
			<button
				type="button"
				onclick={downloadAll}
				disabled={!converter.done.length || zipping}
				class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
			>
				<Icon
					name={zipping ? 'arrow-path-solid' : 'arrow-down-tray-solid'}
					class="size-4 {zipping ? 'animate-spin' : ''}"
				/>
				{converter.done.length > 1 ? `Tout télécharger (.zip)` : 'Télécharger'}
			</button>
		</div>
	</div>
	<ul role="list" class="divide-y divide-gray-100 dark:divide-white/5">
		{#each converter.items as item (item.id)}
			<FileItem {item} outdated={outdatedIds.has(item.id)} />
		{/each}
	</ul>
</section>
