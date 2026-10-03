<script lang="ts">
	import { sourceName, targetName, type Conversion } from '$lib/seo/conversions';
	import Icon from './Icon.svelte';

	let { conversions }: { conversions: Conversion[] } = $props();
</script>

<ul role="list" class="flex flex-wrap gap-2">
	{#each conversions as conversion (conversion.slug)}
		<li>
			<a
				href="/{conversion.slug}"
				class="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
			>
				{sourceName(conversion)}
				<Icon name="arrow-down-solid" class="size-4 -rotate-90 text-gray-400" />
				<span class="sr-only">en</span>
				{targetName(conversion)}
			</a>
		</li>
	{/each}
</ul>
