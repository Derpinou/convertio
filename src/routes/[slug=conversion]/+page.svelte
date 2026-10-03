<script lang="ts">
	import ConverterApp from '$lib/components/ConverterApp.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { CONVERSIONS, conversionTitle, seoName } from '$lib/seo/conversions';
	import { conversionDescription, conversionFaq, FORMAT_ABOUT } from '$lib/seo/copy';
	import { breadcrumbs, faqPage } from '$lib/seo/jsonld';

	let { data } = $props();

	const conversion = $derived(data.conversion);
	const source = $derived(seoName(conversion.from));
	const target = $derived(seoName(conversion.to));
	const name = $derived(conversionTitle(conversion));
	const path = $derived(`/${conversion.slug}`);
	const faq = $derived(conversionFaq(conversion));
	const description = $derived(conversionDescription(conversion));
	/** Conversions qui partagent le format source ou cible. */
	const related = $derived(
		CONVERSIONS.filter(
			(other) =>
				other.slug !== conversion.slug &&
				(other.from === conversion.from || other.to === conversion.to)
		).slice(0, 6)
	);
	const steps = $derived([
		{
			title: `Choisissez « ${seoName(conversion.to)} »`,
			text: `Le format ${target} est déjà sélectionné. Ajustez au besoin la qualité ou les options.`
		},
		{
			title: `Ajoutez vos fichiers ${source}`,
			text: 'Glissez-les dans la zone prévue, sélectionnez-les ou collez-les : la conversion démarre aussitôt.'
		},
		{
			title: 'Téléchargez le résultat',
			text: 'Récupérez chaque image ou toutes à la fois dans une archive ZIP.'
		}
	]);
</script>

<Seo
	title="Convertir {name} gratuitement, sans envoi — Convertio"
	{description}
	{path}
	jsonLd={[
		breadcrumbs([
			{ name: 'Convertio', path: '/' },
			{ name: `${source} en ${target}`, path }
		]),
		faqPage(faq)
	]}
/>

<nav aria-label="Fil d’Ariane" class="pt-6">
	<ol role="list" class="flex items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
		<li>
			<a href="/" class="hover:text-gray-700 dark:hover:text-gray-200">Convertio</a>
		</li>
		<li class="flex items-center gap-x-2">
			<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5 text-gray-300">
				<path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
			</svg>
			<a href={path} aria-current="page" class="font-medium text-gray-700 dark:text-gray-200">
				{name}
			</a>
		</li>
	</ol>
</nav>

<Hero title="Convertir {name}">
	Convertissez vos fichiers {source} en {target} directement dans votre navigateur : gratuit, sans inscription,
	et vos images ne quittent jamais votre appareil.
</Hero>

<ConverterApp target={conversion.to} />

<section aria-labelledby="why-heading" class="mt-16">
	<h2
		id="why-heading"
		class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white"
	>
		Pourquoi convertir vos fichiers {source} en {target} ?
	</h2>
	{#if conversion.note}
		<p class="mt-4 text-base/7 text-gray-600 dark:text-gray-400">{conversion.note}</p>
	{/if}
	<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each [conversion.from, conversion.to] as format (format)}
			<div
				class="rounded-lg bg-white p-5 shadow-xs outline-1 outline-gray-900/5 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
			>
				<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">
					Le format {seoName(format)}
				</h3>
				<p class="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{FORMAT_ABOUT[format]}</p>
			</div>
		{/each}
	</div>
</section>

<section aria-labelledby="howto-heading" class="mt-16">
	<h2
		id="howto-heading"
		class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white"
	>
		Convertir {name} en 3 étapes
	</h2>
	<ol role="list" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
		{#each steps as step, i (step.title)}
			<li>
				<span
					class="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white dark:bg-indigo-500"
				>
					{i + 1}
				</span>
				<h3 class="mt-4 text-sm/6 font-semibold text-gray-900 dark:text-white">{step.title}</h3>
				<p class="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">{step.text}</p>
			</li>
		{/each}
	</ol>
</section>

<Features />

<Faq items={faq} />

{#if related.length}
	<section aria-labelledby="related-heading" class="mt-16">
		<h2 id="related-heading" class="text-base font-semibold text-gray-900 dark:text-white">
			Conversions associées
		</h2>
		<ul role="list" class="mt-4 flex flex-wrap gap-2">
			{#each related as other (other.slug)}
				<li>
					<a
						href="/{other.slug}"
						class="inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
					>
						{seoName(other.from)}
						<Icon name="arrow-down-solid" class="size-4 -rotate-90 text-gray-400" />
						{seoName(other.to)}
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}
