<script lang="ts">
	/** Fil d'Ariane visible ; le JSON-LD correspondant est produit par `breadcrumbs()`. */
	let { items }: { items: { name: string; path: string }[] } = $props();
</script>

<nav aria-label="Fil d’Ariane" class="pt-6">
	<ol
		role="list"
		class="flex flex-wrap items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400"
	>
		{#each items as item, i (item.path)}
			<li class="flex items-center gap-x-2">
				{#if i > 0}
					<svg
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
						class="size-5 text-gray-300 dark:text-gray-600"
					>
						<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
					</svg>
				{/if}
				{#if i === items.length - 1}
					<a
						href={item.path}
						aria-current="page"
						class="font-medium text-gray-700 dark:text-gray-200"
					>
						{item.name}
					</a>
				{:else}
					<a href={item.path} class="hover:text-gray-700 dark:hover:text-gray-200">{item.name}</a>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
