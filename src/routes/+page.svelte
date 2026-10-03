<script lang="ts">
	import ConversionLinks from '$lib/components/ConversionLinks.svelte';
	import ConverterApp from '$lib/components/ConverterApp.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { groupedConversions, HUB_FORMATS, hubSlug, seoName } from '$lib/seo/conversions';
	import { GENERAL_FAQ } from '$lib/seo/copy';
	import { homeDiscordEmbed } from '$lib/seo/discord';
	import { faqPage, webApplication, webSite } from '$lib/seo/jsonld';
	import { HOME } from '$lib/seo/pages';

	const groups = groupedConversions();
</script>

<Seo
	title={HOME.title}
	description={HOME.description}
	path={HOME.path}
	jsonLd={[webSite(HOME.description), webApplication(HOME.description), faqPage(GENERAL_FAQ)]}
	discordEmbed={homeDiscordEmbed()}
/>

<Hero title={HOME.h1}>
	Convertissez vos images HEIC, PNG, JPG, WebP, AVIF, SVG… en quelques secondes, directement dans
	votre navigateur. Vos fichiers ne quittent jamais votre appareil.
</Hero>

<ConverterApp />

<Features />

<section aria-labelledby="all-heading" class="mt-16 lg:mt-24">
	<h2
		id="all-heading"
		class="text-2xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl dark:text-white"
	>
		Toutes les conversions d’images
	</h2>
	<p class="mt-4 max-w-3xl text-base/7 text-gray-600 dark:text-gray-400">
		Chaque conversion est gratuite, sans pub et sans inscription. Choisissez le format de sortie, ou
		une conversion précise pour obtenir des conseils adaptés.
	</p>
	<div class="mt-8">
		<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Convertir en…</h3>
		<ul role="list" class="mt-3 flex flex-wrap gap-2">
			{#each HUB_FORMATS as format (format)}
				<li>
					<a
						href="/{hubSlug(format)}"
						class="inline-flex rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
					>
						{seoName(format)}
					</a>
				</li>
			{/each}
		</ul>
	</div>
	<div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
		{#each groups as { group, label, conversions } (group)}
			<div>
				<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">{label}</h3>
				<div class="mt-3"><ConversionLinks {conversions} /></div>
			</div>
		{/each}
	</div>
</section>

<Faq items={GENERAL_FAQ} />
