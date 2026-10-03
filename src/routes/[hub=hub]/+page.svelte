<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ConversionLinks from '$lib/components/ConversionLinks.svelte';
	import ConverterApp from '$lib/components/ConverterApp.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { HUB_FORMATS, hubSlug, seoName } from '$lib/seo/conversions';
	import {
		FORMAT_ABOUT,
		FORMAT_TIP,
		FORMAT_USE,
		hubConversions,
		hubFaq,
		hubSources
	} from '$lib/seo/copy';
	import { homeDiscordEmbed } from '$lib/seo/discord';
	import { breadcrumbs, faqPage, webApplication } from '$lib/seo/jsonld';
	import { hubMeta } from '$lib/seo/pages';

	let { data } = $props();

	const format = $derived(data.format);
	const meta = $derived(hubMeta(format));
	const name = $derived(seoName(format));
	const faq = $derived(hubFaq(format));
	const conversions = $derived(hubConversions(format));
	const sources = $derived(hubSources(format).map(seoName).join(', '));
	const crumbs = $derived([
		{ name: 'Convertio', path: '/' },
		{ name: `Convertir en ${name}`, path: meta.path }
	]);
</script>

<Seo
	title={meta.title}
	description={meta.description}
	path={meta.path}
	jsonLd={[
		breadcrumbs(crumbs),
		webApplication(meta.description, { name: `Convertisseur ${name}`, path: meta.path }),
		faqPage(faq)
	]}
	discordEmbed={homeDiscordEmbed()}
/>

<Breadcrumbs items={crumbs} />

<Hero title={meta.h1}>
	Convertissez vos images en {name} gratuitement, sans pub ni inscription : {sources}. La conversion
	se fait dans votre navigateur, vos fichiers restent sur votre appareil.
</Hero>

<ConverterApp target={format} />

<section
	aria-labelledby="format-heading"
	class="mt-16 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12"
>
	<div>
		<h2
			id="format-heading"
			class="text-2xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl dark:text-white"
		>
			Pourquoi convertir une image en {name} ?
		</h2>
		<p class="mt-4 text-base/7 text-gray-600 lg:text-lg/8 dark:text-gray-400">
			{FORMAT_ABOUT[format]}
		</p>
		{#if FORMAT_USE[format]}
			<p class="mt-4 text-base/7 text-gray-600 lg:text-lg/8 dark:text-gray-400">
				{FORMAT_USE[format]}
			</p>
		{/if}
	</div>
	{#if FORMAT_TIP[format]}
		<div
			class="mt-8 rounded-lg bg-white p-5 shadow-xs outline-1 outline-gray-900/5 lg:mt-0 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
		>
			<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">Réglage conseillé</h3>
			<p class="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{FORMAT_TIP[format]}</p>
		</div>
	{/if}
</section>

{#if conversions.length}
	<section aria-labelledby="sources-heading" class="mt-16 lg:mt-24">
		<h2
			id="sources-heading"
			class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white"
		>
			Convertir en {name} depuis…
		</h2>
		<p class="mt-4 text-base/7 text-gray-600 dark:text-gray-400">
			Des conseils adaptés à chaque format d’origine :
		</p>
		<div class="mt-6"><ConversionLinks {conversions} /></div>
	</section>
{/if}

<Features />

<Faq items={faq} />

<section aria-labelledby="formats-heading" class="mt-16 lg:mt-24">
	<h2 id="formats-heading" class="text-base font-semibold text-gray-900 dark:text-white">
		Autres formats de sortie
	</h2>
	<ul role="list" class="mt-4 flex flex-wrap gap-2">
		{#each HUB_FORMATS.filter((other) => other !== format) as other (other)}
			<li>
				<a
					href="/{hubSlug(other)}"
					class="inline-flex rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
				>
					Convertir en {seoName(other)}
				</a>
			</li>
		{/each}
	</ul>
</section>
