<script lang="ts">
	import type { FaqItem } from '$lib/seo/copy';

	let { items, title = 'Questions fréquentes' }: { items: FaqItem[]; title?: string } = $props();
</script>

<section aria-labelledby="faq-heading" class="mt-16">
	<h2
		id="faq-heading"
		class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white"
	>
		{title}
	</h2>
	<dl class="mt-8 divide-y divide-gray-900/10 dark:divide-white/10">
		{#each items as item (item.question)}
			<div class="py-6 first:pt-0 last:pb-0 sm:grid sm:grid-cols-12 sm:gap-8">
				<dt class="text-base/7 font-semibold text-gray-900 sm:col-span-5 dark:text-white">
					{item.question}
				</dt>
				<dd class="mt-2 text-base/7 text-gray-600 sm:col-span-7 sm:mt-0 dark:text-gray-400">
					{item.answer}
				</dd>
			</div>
		{/each}
	</dl>
</section>
