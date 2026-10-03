<script lang="ts">
	import type { IconName } from './icons';
	import Icon from './Icon.svelte';

	const features: { icon: IconName; title: string; text: string }[] = [
		{
			icon: 'gift',
			title: '100 % gratuit',
			text: 'Sans abonnement, sans limite de fichiers ni de taille, sans filigrane. Toutes les fonctions pour tout le monde.'
		},
		{
			icon: 'no-symbol',
			title: 'Sans pub ni traceur',
			text: 'Aucune publicité, aucun cookie, aucune mesure d’audience. Juste l’outil, rien d’autre.'
		},
		{
			icon: 'lock-closed',
			title: '100 % local',
			text: 'Vos images sont converties sur votre appareil et ne sont jamais envoyées sur Internet.'
		},
		{
			icon: 'signal-slash',
			title: 'Fonctionne hors ligne',
			text: 'Installez l’application : elle continue de marcher sans connexion, sur mobile comme sur ordinateur.'
		}
	];
</script>

<section aria-labelledby="features-heading" class="mt-16 lg:mt-24">
	<h2 id="features-heading" class="sr-only">Pourquoi choisir Convertio</h2>
	<dl class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
		{#each features as feature (feature.title)}
			<div>
				<dt class="flex items-center gap-x-3 text-sm/6 font-semibold text-gray-900 dark:text-white">
					<span
						class="flex size-8 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500"
					>
						<Icon name={feature.icon} class="size-5 text-white" />
					</span>
					{feature.title}
				</dt>
				<dd class="mt-2 text-sm/6 text-gray-600 dark:text-gray-400">{feature.text}</dd>
			</div>
		{/each}
	</dl>
</section>
