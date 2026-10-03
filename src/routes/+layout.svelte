<script lang="ts">
	import '@fontsource-variable/inter';
	import '../app.css';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import AboutDialog from '$lib/components/AboutDialog.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import InstallDialog from '$lib/components/InstallDialog.svelte';
	import Notifications from '$lib/components/Notifications.svelte';
	import { pwa } from '$lib/state/pwa.svelte';

	let { children } = $props();

	onMount(() => {
		// Comportements des composants Tailwind Plus (dialogues…), chargés côté client uniquement.
		void import('@tailwindplus/elements');
		void pwa.init();
	});
</script>

<svelte:head>
	{#if pwaInfo}
		<link rel="manifest" href={pwaInfo.webManifest.href} />
	{/if}
</svelte:head>

<div class="flex min-h-full flex-col">
	<Header />

	<main class="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
		{@render children()}
	</main>

	<Footer />
</div>

<AboutDialog />
<InstallDialog />
<Notifications />
