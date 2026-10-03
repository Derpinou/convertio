<script lang="ts">
	import { page } from '$app/state';
	import { SITE_NAME } from '$lib/site';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page introuvable' : 'Erreur'} — {SITE_NAME}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="py-24 text-center sm:py-32">
	<p class="text-base font-semibold text-indigo-600 dark:text-indigo-400">{page.status}</p>
	<h1
		class="mt-4 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white"
	>
		{page.status === 404 ? 'Page introuvable' : 'Une erreur est survenue'}
	</h1>
	<p class="mt-6 text-base/7 text-pretty text-gray-600 dark:text-gray-400">
		{page.status === 404
			? 'Cette page n’existe pas ou a été déplacée.'
			: 'Rechargez la page ou revenez à l’accueil.'}
	</p>
	<div class="mt-10 flex items-center justify-center">
		<a
			href="/"
			class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
		>
			Convertir des images
		</a>
	</div>
</div>
