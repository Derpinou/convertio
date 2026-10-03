<script lang="ts">
	import ConverterApp from '$lib/components/ConverterApp.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { GENERAL_FAQ } from '$lib/seo/copy';
	import { faqPage, webApplication } from '$lib/seo/jsonld';

	const description =
		'Convertissez vos images HEIC, PNG, JPG, WebP, AVIF, SVG et plus, gratuitement et directement dans votre navigateur. Sans inscription, vos fichiers restent sur votre appareil.';
</script>

<Seo
	title="Convertio — Convertisseur d’images gratuit, 100 % local"
	{description}
	path="/"
	jsonLd={[webApplication(description), faqPage(GENERAL_FAQ)]}
/>

<Hero title="Convertissez vos images, sans les envoyer nulle part">
	HEIC, PNG, JPEG, WebP, AVIF, SVG… La conversion se fait directement dans votre navigateur.
</Hero>

<ConverterApp />

<Features />

<Faq items={GENERAL_FAQ} />
