<script lang="ts">
	import { pwa } from '$lib/state/pwa.svelte';
	import Icon from './Icon.svelte';
	import { REPOSITORY_URL } from '$lib/site';
</script>

<header class="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
	<nav
		aria-label="Navigation principale"
		class="mx-auto flex max-w-7xl items-center justify-between gap-x-4 px-4 py-3 sm:px-6 lg:px-8"
	>
		<a href="/" class="-m-1.5 flex items-center gap-x-2.5 p-1.5">
			<img src="/favicon.svg" alt="" class="size-8" width="32" height="32" />
			<span class="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
				Convertio
			</span>
		</a>
		<div class="flex items-center gap-x-1 sm:gap-x-2">
			<button
				type="button"
				command="show-modal"
				commandfor="about-dialog"
				class="rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
			>
				À propos
			</button>
			{#if pwa.canInstall}
				{#if pwa.installEvent}
					<button
						type="button"
						onclick={() => pwa.install()}
						class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
					>
						<Icon name="arrow-down-tray-solid" class="size-4" />
						Installer
					</button>
				{:else}
					<button
						type="button"
						command="show-modal"
						commandfor="install-dialog"
						class="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30"
					>
						<Icon name="arrow-down-tray-solid" class="size-4" />
						Installer
					</button>
				{/if}
			{/if}
			<a
				href={REPOSITORY_URL}
				target="_blank"
				rel="noopener noreferrer"
				class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
			>
				<span class="sr-only">Code source sur GitHub</span>
				<Icon name="github" class="size-5" />
			</a>
		</div>
	</nav>
</header>
