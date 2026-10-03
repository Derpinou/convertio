<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { IconName } from './icons';
	import Icon from './Icon.svelte';

	let {
		id,
		title,
		icon,
		children
	}: { id: string; title: string; icon?: IconName; children: Snippet } = $props();
</script>

<!-- Modale Tailwind Plus : le comportement (ouverture, focus, Échap, transitions) est géré par Elements. -->
<el-dialog>
	<dialog
		{id}
		aria-labelledby="{id}-title"
		class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent"
	>
		<el-dialog-backdrop
			class="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-950/70"
		></el-dialog-backdrop>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex (balisage Tailwind Plus : cible du clic hors panneau) -->
		<div
			tabindex="0"
			class="flex min-h-full items-end justify-center p-4 text-center focus:outline-none sm:items-center sm:p-0"
		>
			<el-dialog-panel
				class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95 dark:bg-gray-800 dark:outline dark:-outline-offset-1 dark:outline-white/10"
			>
				<div class="absolute top-0 right-0 pt-4 pr-4">
					<button
						type="button"
						command="close"
						commandfor={id}
						class="rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-gray-300"
					>
						<span class="sr-only">Fermer</span>
						<Icon name="x-mark" class="size-6" />
					</button>
				</div>
				<div class="sm:flex sm:items-start">
					{#if icon}
						<div
							class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:size-10 dark:bg-indigo-500/10"
						>
							<Icon name={icon} class="size-6 text-indigo-600 dark:text-indigo-400" />
						</div>
					{/if}
					<div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
						<h3 id="{id}-title" class="text-base font-semibold text-gray-900 dark:text-white">
							{title}
						</h3>
						<div class="mt-3 text-sm text-gray-600 dark:text-gray-300">
							{@render children()}
						</div>
					</div>
				</div>
				<div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
					<button
						type="button"
						command="close"
						commandfor={id}
						class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:w-auto dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400"
					>
						J’ai compris
					</button>
				</div>
			</el-dialog-panel>
		</div>
	</dialog>
</el-dialog>
