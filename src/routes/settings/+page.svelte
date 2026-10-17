<script lang="ts">
	import Type from "@lucide/svelte/icons/type"
	import Store from "@lucide/svelte/icons/store"
	import Palette from "@lucide/svelte/icons/palette"
	import Settings from "@lucide/svelte/icons/settings"
	import Squircle from "@lucide/svelte/icons/squircle"
	import RotateCcw from "@lucide/svelte/icons/rotate-ccw"
	import Smartphone from "@lucide/svelte/icons/smartphone"
	import ChevronRight from "@lucide/svelte/icons/chevron-right"

	import PageHeader from "#lib/shared/components/PageHeader.svelte"

	import { ACCENT_PRESETS } from "#lib/settings/palette"
	import { type RadiusProfile, settings, type UiScale } from "#lib/settings/settings.svelte"

	const scaleOptions: { value: UiScale; label: string }[] = [
		{ value: "compact", label: "Compacto" },
		{ value: "normal", label: "Normal" },
		{ value: "large", label: "Grande" },
	]

	const radiusOptions: { value: RadiusProfile; label: string }[] = [
		{ value: "round", label: "Redondeado" },
		{ value: "medium", label: "Intermedio" },
		{ value: "square", label: "Recto" },
	]
</script>

<PageHeader title="Ajustes" subtitle="Personaliza tu app" icon={Settings} />

<div class="space-y-4 px-5 pt-4 pb-28">
	<section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70">
		<h2 class="flex items-center gap-2 font-bold">
			<Store size={17} class="text-primary-600" />
			Identidad
		</h2>
		<label class="mt-3 block">
			<span class="mb-1.5 block text-sm font-semibold text-neutral-700">Nombre de la tienda</span>
			<input
				value={settings.value.storeName}
				oninput={(event) => settings.patch({ storeName: event.currentTarget.value })}
				maxlength="40"
				placeholder="pymeapp"
				class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
			>
		</label>
	</section>

	<section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70">
		<h2 class="flex items-center gap-2 font-bold">
			<Palette size={17} class="text-primary-600" />
			Color de acento
		</h2>
		<div class="mt-3 flex flex-wrap items-center gap-2.5">
			{#each ACCENT_PRESETS as preset (preset)}
				<button
					type="button"
					onclick={() => settings.patch({ accent: preset })}
					aria-label={preset}
					class="size-9 rounded-pill ring-2 ring-offset-2 transition {settings.value.accent ===
					preset
						? "ring-neutral-800"
						: "ring-transparent"}"
					style="background: {preset}"
				></button>
			{/each}
			<label
				class="relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-pill ring-1 ring-neutral-300"
			>
				<input
					type="color"
					value={settings.value.accent}
					oninput={(event) => settings.patch({ accent: event.currentTarget.value })}
					aria-label="Color personalizado"
					class="absolute inset-0 cursor-pointer opacity-0"
				>
				<span class="text-sm font-bold text-neutral-400">+</span>
			</label>
		</div>
		<p class="mt-3 text-xs text-neutral-400">
			Se aplica a botones, enlaces y acentos de toda la app.
		</p>
	</section>

	<section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70">
		<h2 class="flex items-center gap-2 font-bold">
			<Type size={17} class="text-primary-600" />
			Tamaño de la interfaz
		</h2>
		<div class="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-neutral-100 p-1">
			{#each scaleOptions as option (option.value)}
				<button
					type="button"
					onclick={() => settings.patch({ uiScale: option.value })}
					class="rounded-xl py-2 text-sm font-semibold transition-colors {settings.value.uiScale ===
					option.value
						? "bg-white text-primary-600 shadow-sm"
						: "text-neutral-500"}"
				>
					{option.label}
				</button>
			{/each}
		</div>
	</section>

	<section class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70">
		<h2 class="flex items-center gap-2 font-bold">
			<Squircle size={17} class="text-primary-600" />
			Redondeo
		</h2>
		<div class="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-neutral-100 p-1">
			{#each radiusOptions as option (option.value)}
				<button
					type="button"
					onclick={() => settings.patch({ radius: option.value })}
					class="rounded-xl py-2 text-sm font-semibold transition-colors {settings.value.radius ===
					option.value
						? "bg-white text-primary-600 shadow-sm"
						: "text-neutral-500"}"
				>
					{option.label}
				</button>
			{/each}
		</div>
		<p class="mt-3 text-xs text-neutral-400">
			Cambia el redondeo de tarjetas, botones y píldoras en toda la app.
		</p>
	</section>

	<a
		href="/pwa"
		class="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200/70 transition-colors active:bg-neutral-100"
	>
		<span
			class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white"
		>
			<Smartphone size={18} />
		</span>
		<span class="min-w-0 flex-1">
			<span class="block font-bold">Instalar app</span>
			<span class="block text-xs text-neutral-400">Añádela a tu pantalla de inicio</span>
		</span>
		<ChevronRight size={18} class="shrink-0 text-neutral-300" />
	</a>

	<button
		type="button"
		onclick={() => settings.reset()}
		class="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-600 transition-colors active:bg-neutral-100"
	>
		<RotateCcw size={16} />
		Restablecer valores
	</button>
</div>
