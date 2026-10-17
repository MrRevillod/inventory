<script lang="ts">
	import Check from "@lucide/svelte/icons/check"
	import Share from "@lucide/svelte/icons/share"
	import Download from "@lucide/svelte/icons/download"
	import Smartphone from "@lucide/svelte/icons/smartphone"

	import PageHeader from "#lib/shared/components/PageHeader.svelte"

	import { settings } from "#lib/settings/settings.svelte"

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>
		userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
	}

	let prompt = $state<BeforeInstallPromptEvent | null>(null)
	let installed = $state(false)
	let isIos = $state(false)

	$effect(() => {
		installed =
			window.matchMedia("(display-mode: standalone)").matches ||
			(navigator as Navigator & { standalone?: boolean }).standalone === true
		isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

		const onPrompt = (event: Event) => {
			event.preventDefault()
			prompt = event as BeforeInstallPromptEvent
		}
		const onInstalled = () => {
			installed = true
			prompt = null
		}

		window.addEventListener("beforeinstallprompt", onPrompt)
		window.addEventListener("appinstalled", onInstalled)
		return () => {
			window.removeEventListener("beforeinstallprompt", onPrompt)
			window.removeEventListener("appinstalled", onInstalled)
		}
	})

	async function install() {
		if (!prompt) return
		await prompt.prompt()
		const choice = await prompt.userChoice
		if (choice.outcome === "accepted") installed = true
		prompt = null
	}
</script>

<PageHeader title="Instalar app" subtitle="Llévala a tu pantalla de inicio" icon={Smartphone} />

<div class="space-y-4 px-5 pt-4 pb-28">
	<section
		class="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-neutral-200/70"
	>
		<img
			src="/pwa-192x192.png"
			alt="inventory"
			width="72"
			height="72"
			class="size-18 rounded-2xl shadow-sm"
		>
		<div>
			<h2 class="text-lg font-extrabold tracking-tight">{settings.value.storeName}</h2>
			<p class="text-xs text-neutral-400">
				Inventario, atenciones y servicios de tu salón de uñas.
			</p>
		</div>

		{#if installed}
			<span
				class="flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-600"
			>
				<Check size={16} />
				Ya está instalada
			</span>
		{:else if prompt}
			<button
				type="button"
				onclick={install}
				class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
			>
				<Download size={16} />
				Instalar app
			</button>
		{:else if isIos}
			<div class="w-full rounded-2xl bg-neutral-100 p-4 text-left">
				<p class="flex items-center gap-2 text-sm font-semibold">
					<Share size={15} class="text-primary-600" />
					Para instalar en iPhone
				</p>
				<ol class="mt-2 list-inside list-decimal space-y-1 text-xs text-neutral-500">
					<li>Toca <b>Compartir</b> en Safari.</li>
					<li>Elige <b>Añadir a pantalla de inicio</b>.</li>
					<li>Confirma con <b>Añadir</b>.</li>
				</ol>
			</div>
		{:else}
			<div class="w-full rounded-2xl bg-neutral-100 p-4 text-left text-xs text-neutral-500">
				Abre el menú de tu navegador y elige <b>Instalar app</b> (o
				<b>Añadir a pantalla de inicio</b>).
			</div>
		{/if}
	</section>

	<section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70">
		<h2 class="font-bold">¿Por qué instalarla?</h2>
		<ul class="mt-3 space-y-2 text-sm text-neutral-600">
			<li class="flex gap-2">
				<span class="mt-1.5 size-1.5 shrink-0 rounded-pill bg-primary-600"></span>
				Se abre a pantalla completa, sin la barra del navegador.
			</li>
			<li class="flex gap-2">
				<span class="mt-1.5 size-1.5 shrink-0 rounded-pill bg-primary-600"></span>
				Acceso directo desde tu pantalla de inicio.
			</li>
			<li class="flex gap-2">
				<span class="mt-1.5 size-1.5 shrink-0 rounded-pill bg-primary-600"></span>
				Arranca más rápido, incluso con mala señal.
			</li>
		</ul>
	</section>
</div>
