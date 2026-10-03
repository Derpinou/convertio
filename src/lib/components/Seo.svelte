<script lang="ts">
	import { serializeDiscordEmbed, type DiscordEmbed } from '$lib/seo/discord';
	import { serializeJsonLd } from '$lib/seo/jsonld';
	import { absoluteUrl, OG_IMAGE, SITE_NAME } from '$lib/site';

	let {
		title,
		description,
		path,
		jsonLd = [],
		discordEmbed
	}: {
		title: string;
		description: string;
		/** Chemin de la page, ex. `/heic-en-jpg`. */
		path: string;
		jsonLd?: Record<string, unknown>[];
		/** Aperçu de lien Discord avec boutons (repli : Open Graph). */
		discordEmbed?: DiscordEmbed;
	} = $props();

	const url = $derived(absoluteUrl(path));
	const image = absoluteUrl(OG_IMAGE.path);
	const discordScript = $derived(
		discordEmbed
			? `<script id="discord:component-embed" type="application/vnd.discord.component-embed+json">${serializeDiscordEmbed(discordEmbed)}</` +
					'script>'
			: ''
	);
	const scripts = $derived(
		jsonLd.map(
			(data) => `<script type="application/ld+json">${serializeJsonLd(data)}</` + 'script>'
		)
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content={String(OG_IMAGE.width)} />
	<meta property="og:image:height" content={String(OG_IMAGE.height)} />
	<meta property="og:image:alt" content={OG_IMAGE.alt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={OG_IMAGE.alt} />

	<!-- Données (JSON-LD, aperçu Discord) : non exécutées, donc non soumises à la CSP. -->
	{#if discordScript}
		{@html discordScript}
	{/if}
	{#each scripts as script, i (i)}
		{@html script}
	{/each}
</svelte:head>
