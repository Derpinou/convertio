<script lang="ts">
	import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
	import ConversionLinks from '$lib/components/ConversionLinks.svelte';
	import ConverterApp from '$lib/components/ConverterApp.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import {
		conversionTitle,
		relatedConversions,
		sourceName,
		targetName
	} from '$lib/seo/conversions';
	import { conversionFaq, FORMAT_ABOUT, FORMAT_TIP } from '$lib/seo/copy';
	import { conversionDiscordEmbed } from '$lib/seo/discord';
	import { breadcrumbs, faqPage, webApplication } from '$lib/seo/jsonld';
	import { conversionMeta, hubMeta } from '$lib/seo/pages';

	let { data } = $props();

	const conversion = $derived(data.conversion);
	const meta = $derived(conversionMeta(conversion));
	const hub = $derived(hubMeta(conversion.to));
	const source = $derived(sourceName(conversion));
	const target = $derived(targetName(conversion));
	const name = $derived(conversionTitle(conversion));
	const faq = $derived(conversionFaq(conversion));
	const crumbs = $derived([
		{ name: 'Convertio', path: '/' },
		{ name: `Convertir en ${target}`, path: hub.path },
		{ name, path: meta.path }
	]);
	/** Fiches des deux formats (le JFIF a sa propre présentation). */
	const formats = $derived([
		{ name: source, about: conversion.fromAbout ?? FORMAT_ABOUT[conversion.from] },
		{ name: target, about: FORMAT_ABOUT[conversion.to] }
	]);
	const tips = $derived(
		[...(conversion.tips ?? []), FORMAT_TIP[conversion.to]].filter((tip): tip is string => !!tip)
	);
	const related = $derived(relatedConversions(conversion, 8));
	const steps = $derived([
		{
			title: `Choisissez « ${target} »`,
			text: `Le format ${target} est déjà sélectionné. Ajustez au besoin la qualité ou les options.`
		},
		{
			title: `Ajoutez vos fichiers ${source}`,
			text: 'Glissez-les dans la zone prévue, sélectionnez-les ou collez-les : la conversion démarre aussitôt.'
		},
		{
			title: 'Téléchargez le résultat',
			text: 'Récupérez chaque image ou toutes à la fois dans une archive ZIP. C’est gratuit, sans limite.'
		}
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
	discordEmbed={conversionDiscordEmbed(conversion)}
/>

<Breadcrumbs items={crumbs} />

<Hero title={meta.h1}>
	Convertissez vos fichiers {source} en {target} en quelques secondes, sans pub ni inscription. La conversion
	se fait dans votre navigateur : vos images ne quittent jamais votre appareil.
</Hero>

<ConverterApp target={conversion.to} />

<section
	aria-labelledby="why-heading"
	class="mt-16 lg:mt-24 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12"
>
	<div>
		<h2
			id="why-heading"
			class="text-2xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-3xl dark:text-white"
		>
			Pourquoi convertir vos fichiers {source} en {target} ?
		</h2>
		<p class="mt-4 text-base/7 text-gray-600 lg:text-lg/8 dark:text-gray-400">{conversion.note}</p>
		{#if tips.length}
			<h3 class="mt-8 text-base font-semibold text-gray-900 dark:text-white">Bon à savoir</h3>
			<ul role="list" class="mt-4 space-y-3">
				{#each tips as tip (tip)}
					<li class="flex gap-x-3 text-base/7 text-gray-600 dark:text-gray-400">
						<Icon
							name="check-circle-solid"
							class="mt-1 size-5 flex-none text-indigo-600 dark:text-indigo-400"
						/>
						{tip}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
	<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-1">
		{#each formats as format (format.name)}
			<div
				class="rounded-lg bg-white p-5 shadow-xs outline-1 outline-gray-900/5 dark:bg-gray-900 dark:shadow-none dark:outline-white/10"
			>
				<h3 class="text-sm/6 font-semibold text-gray-900 dark:text-white">
					Le format {format.name}
				</h3>
				<p class="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{format.about}</p>
			</div>
		{/each}
	</div>
</section>

<section aria-labelledby="howto-heading" class="mt-16 lg:mt-24">
	<h2
		id="howto-heading"
		class="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-white"
	>
		Convertir {name} en 3 étapes
	</h2>
	<ol role="list" class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:mt-10 lg:gap-12">
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

<section aria-labelledby="related-heading" class="mt-16 lg:mt-24">
	<h2 id="related-heading" class="text-base font-semibold text-gray-900 dark:text-white">
		Conversions associées
	</h2>
	<div class="mt-4"><ConversionLinks conversions={related} /></div>
	<p class="mt-6 text-sm/6">
		<a
			href={hub.path}
			class="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
		>
			Toutes les conversions en {target} <span aria-hidden="true">→</span>
		</a>
	</p>
</section>
