<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts, type ToastKind } from '$lib/state/toasts.svelte';
	import type { IconName } from './icons';
	import Icon from './Icon.svelte';

	const ICONS: Record<ToastKind, { name: IconName; class: string }> = {
		success: { name: 'check-circle', class: 'text-green-400' },
		info: { name: 'information-circle', class: 'text-indigo-400' },
		error: { name: 'exclamation-triangle', class: 'text-red-400' }
	};
</script>

<!-- Notifications Tailwind Plus, empilées en bas à droite (en haut sur mobile). -->
<div
	aria-live="assertive"
	class="pointer-events-none fixed inset-0 z-40 flex items-end px-4 py-6 sm:items-end sm:p-6"
>
	<div class="flex w-full flex-col items-center space-y-4 sm:items-end">
		{#each toasts.items as toast (toast.id)}
			<div
				transition:fly={{ y: 16, duration: 200 }}
				class="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline-1 outline-black/5 dark:bg-gray-800 dark:-outline-offset-1 dark:outline-white/10"
				role="status"
			>
				<div class="p-4">
					<div class="flex items-start">
						<div class="shrink-0">
							<Icon name={ICONS[toast.kind].name} class="size-6 {ICONS[toast.kind].class}" />
						</div>
						<div class="ml-3 w-0 flex-1 pt-0.5">
							<p class="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
							{#if toast.message}
								<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.message}</p>
							{/if}
							{#if toast.action}
								<div class="mt-3 flex">
									<button
										type="button"
										onclick={() => {
											toast.action?.run();
											toasts.dismiss(toast.id);
										}}
										class="rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
									>
										{toast.action.label}
									</button>
								</div>
							{/if}
						</div>
						<div class="ml-4 flex shrink-0">
							<button
								type="button"
								onclick={() => toasts.dismiss(toast.id)}
								class="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:text-white"
							>
								<span class="sr-only">Fermer</span>
								<Icon name="x-mark-solid" class="size-5" />
							</button>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
