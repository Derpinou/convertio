<script lang="ts">
	import type { FaqItem } from '$lib/seo/copy';
	import { REPOSITORY_URL } from '$lib/site';

	let { items, title = 'Questions fréquentes' }: { items: FaqItem[]; title?: string } = $props();
</script>

<!-- FAQ Tailwind Plus « offset with supporting text » : titre à gauche sur grand écran. -->
<section aria-labelledby="faq-heading" class="mt-16 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-8">
	<div class="lg:col-span-4">
		<h2
			id="faq-heading"
			class="text-2xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl dark:text-white"
		>
			{title}
		</h2>
		<p class="mt-4 text-base/7 text-pretty text-gray-600 dark:text-gray-400">
			Une autre question ? Le projet est libre :
			<a
				href="{REPOSITORY_URL}/issues"
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
				>posez-la sur GitHub</a
			>.
		</p>
	</div>
	<dl class="mt-10 space-y-8 lg:col-span-8 lg:mt-0">
		{#each items as item (item.question)}
			<div>
				<dt class="text-base/7 font-semibold text-gray-900 dark:text-white">{item.question}</dt>
				<dd class="mt-2 text-base/7 text-gray-600 dark:text-gray-400">{item.answer}</dd>
			</div>
		{/each}
	</dl>
</section>
