<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="mx-auto max-w-3xl py-10 text-center sm:py-14 lg:py-16">
	<h1
		class="text-3xl font-semibold tracking-tight text-balance text-gray-900 sm:text-4xl lg:text-5xl dark:text-white"
	>
		{title}
	</h1>
	<p
		class="mx-auto mt-4 max-w-2xl text-base text-pretty text-gray-600 sm:text-lg lg:mt-6 lg:text-xl/8 dark:text-gray-400"
	>
		{@render children()}
	</p>
	<p
		class="mt-5 inline-flex items-center gap-x-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 inset-ring inset-ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:inset-ring-green-500/20"
	>
		<Icon name="lock-closed" class="size-4" />
		Vos fichiers restent sur votre appareil
	</p>
</div>
