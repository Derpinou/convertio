<script lang="ts">
	import { version } from '$app/environment';
	import { page } from '$app/state';
	import { conversionTitle, groupedConversions } from '$lib/seo/conversions';
	import { pwa } from '$lib/state/pwa.svelte';
	import { REPOSITORY_URL } from '$lib/site';
	import Icon from './Icon.svelte';

	const groups = groupedConversions();
</script>

<footer class="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8 lg:pt-16">
		<div class="lg:grid lg:grid-cols-3 lg:gap-8">
			<div class="space-y-4">
				<a href="/" class="-m-1.5 inline-flex items-center gap-x-2.5 p-1.5">
					<img src="/favicon.svg" alt="" class="size-8" width="32" height="32" />
					<span class="text-base font-semibold tracking-tight text-gray-900 dark:text-white">
						Convertio
					</span>
				</a>
				<p class="max-w-xs text-sm/6 text-pretty text-gray-600 dark:text-gray-400">
					Convertisseur d’images gratuit et libre. La conversion se fait dans votre navigateur : vos
					fichiers ne quittent jamais votre appareil.
				</p>
				<a
					href={REPOSITORY_URL}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
				>
					<span class="sr-only">Code source sur GitHub</span>
					<Icon name="github" class="size-6" />
				</a>
			</div>

			<nav aria-labelledby="footer-conversions" class="mt-12 lg:col-span-2 lg:mt-0">
				<h2 id="footer-conversions" class="text-sm/6 font-semibold text-gray-900 dark:text-white">
					Conversions populaires
				</h2>
				<div class="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-4">
					{#each groups as { group, label, conversions } (group)}
						<div>
							<h3 class="text-xs/6 font-semibold text-gray-500 uppercase dark:text-gray-400">
								{label}
							</h3>
							<ul role="list" class="mt-3 space-y-2">
								{#each conversions as conversion (conversion.slug)}
									<li>
										<a
											href="/{conversion.slug}"
											aria-current={page.url.pathname === `/${conversion.slug}`
												? 'page'
												: undefined}
											class="text-sm/6 text-gray-600 hover:text-gray-900 aria-[current=page]:font-semibold aria-[current=page]:text-indigo-600 dark:text-gray-400 dark:hover:text-white dark:aria-[current=page]:text-indigo-400"
										>
											{conversionTitle(conversion)}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</nav>
		</div>

		<div
			class="mt-12 flex flex-col items-center gap-4 border-t border-gray-900/10 pt-8 text-sm text-gray-500 sm:flex-row sm:justify-between dark:border-white/10 dark:text-gray-400"
		>
			<p>
				Convertio · Libre sous licence
				<a
					href="{REPOSITORY_URL}/blob/main/LICENSE"
					target="_blank"
					rel="noopener noreferrer"
					class="underline decoration-gray-300 underline-offset-2 hover:text-gray-700 dark:decoration-gray-600 dark:hover:text-gray-200"
					>Apache 2.0</a
				>
			</p>
			{#if pwa.supported}
				{#if pwa.offline === 'ready'}
					<p
						class="inline-flex items-center gap-x-1.5 text-green-700 dark:text-green-400"
						data-testid="offline-ready"
					>
						<Icon name="check-circle-solid" class="size-4" />
						Disponible hors ligne
					</p>
				{:else if pwa.offline !== 'unknown'}
					<button
						type="button"
						onclick={() => pwa.makeAvailableOffline()}
						disabled={pwa.offline === 'downloading'}
						class="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-wait disabled:opacity-60 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon
							name={pwa.offline === 'downloading' ? 'arrow-path' : 'cloud-arrow-down'}
							class="size-4 {pwa.offline === 'downloading' ? 'animate-spin' : ''}"
						/>
						{pwa.offline === 'downloading'
							? 'Téléchargement des codecs…'
							: 'Rendre disponible hors ligne'}
					</button>
				{/if}
			{/if}
			<p class="text-xs text-gray-400 dark:text-gray-500">v{version}</p>
		</div>
	</div>
</footer>
