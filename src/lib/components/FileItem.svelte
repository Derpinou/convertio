<script lang="ts">
	import { FORMATS, formatBytes } from '$lib/formats';
	import { canShareFiles, shareFiles } from '$lib/files';
	import { converter, type QueueItem } from '$lib/state/converter.svelte';
	import { toasts } from '$lib/state/toasts.svelte';
	import Icon from './Icon.svelte';

	let { item, outdated }: { item: QueueItem; outdated: boolean } = $props();

	const output = $derived(item.status === 'done' ? item.output : undefined);
	const sourceLabel = $derived(item.sourceFormat ? FORMATS[item.sourceFormat].label : '…');
	const targetLabel = $derived(FORMATS[output?.format ?? converter.settings.format].label);
	const shareFile = $derived(
		output ? new File([output.blob], output.name, { type: output.blob.type }) : undefined
	);
	const canShare = $derived(shareFile ? canShareFiles([shareFile]) : false);
	const savings = $derived(output ? Math.round((1 - output.blob.size / item.size) * 100) : 0);

	async function share() {
		if (!shareFile) return;
		try {
			await shareFiles([shareFile]);
		} catch {
			toasts.push({
				kind: 'error',
				title: 'Partage impossible',
				message: 'Téléchargez le fichier à la place.'
			});
		}
	}
</script>

<li
	class="flex items-center gap-x-4 px-4 py-4 sm:px-6"
	data-testid="file-item"
	data-status={item.status}
>
	<div
		class="relative size-14 shrink-0 overflow-hidden rounded-md bg-checkerboard ring-1 ring-gray-900/5 dark:ring-white/10"
	>
		{#if output?.thumbUrl}
			<img src={output.thumbUrl} alt="" class="size-full object-cover" />
		{:else if item.status === 'error'}
			<div class="flex size-full items-center justify-center bg-red-50 dark:bg-red-500/10">
				<Icon name="exclamation-triangle" class="size-6 text-red-500" />
			</div>
		{:else}
			<div class="flex size-full items-center justify-center bg-gray-50 dark:bg-white/5">
				<Icon
					name="arrow-path"
					class="size-6 text-indigo-500 {item.status === 'converting'
						? 'animate-spin'
						: 'opacity-40'}"
				/>
			</div>
		{/if}
	</div>

	<div class="min-w-0 flex-auto">
		<p class="truncate text-sm/6 font-semibold text-gray-900 dark:text-white" title={item.name}>
			{output?.name ?? item.name}
		</p>
		<div
			class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs/5 text-gray-500 dark:text-gray-400"
		>
			<span class="font-medium text-gray-700 dark:text-gray-300">
				{sourceLabel}
				<Icon name="arrow-down-solid" class="inline size-3 -rotate-90" />
				{targetLabel}
			</span>
			{#if output}
				<svg viewBox="0 0 2 2" class="hidden size-0.5 fill-current sm:block" aria-hidden="true"
					><circle cx="1" cy="1" r="1" /></svg
				>
				<span>{formatBytes(item.size)} → {formatBytes(output.blob.size)}</span>
				{#if savings > 0}
					<span
						class="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:inset-ring-green-500/20"
					>
						−{savings} %
					</span>
				{/if}
				<span class="hidden sm:inline">{output.width} × {output.height}</span>
				{#if outdated}
					<span
						class="inline-flex items-center rounded-md bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-800 inset-ring inset-ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:inset-ring-yellow-400/20"
					>
						Anciens réglages
					</span>
				{/if}
			{:else if item.status === 'error'}
				<span class="text-red-600 dark:text-red-400">{item.error}</span>
			{:else if item.status === 'converting'}
				<span>Conversion en cours…</span>
			{:else}
				<span>En attente…</span>
			{/if}
		</div>
	</div>

	<div class="flex shrink-0 items-center gap-x-1 sm:gap-x-2">
		{#if output}
			{#if canShare}
				<button
					type="button"
					onclick={share}
					class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
				>
					<span class="sr-only">Partager {output.name}</span>
					<Icon name="share" class="size-5" />
				</button>
			{/if}
			<a
				href={output.url}
				download={output.name}
				class="inline-flex items-center gap-x-1.5 rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20"
			>
				<Icon name="arrow-down-tray-solid" class="size-4 text-gray-400" />
				<span class="sr-only sm:not-sr-only">Télécharger</span>
			</a>
		{:else if item.status === 'error' && item.sourceFormat}
			<button
				type="button"
				onclick={() => converter.retry(item.id)}
				class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20"
			>
				Réessayer
			</button>
		{/if}
		<button
			type="button"
			onclick={() => converter.remove(item.id)}
			class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white"
		>
			<span class="sr-only">Retirer {item.name}</span>
			<Icon name="x-mark-solid" class="size-5" />
		</button>
	</div>
</li>
