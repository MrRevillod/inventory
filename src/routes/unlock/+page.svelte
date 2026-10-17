<script lang="ts">
	import Lock from "@lucide/svelte/icons/lock"

	import PinPad from "#lib/auth/components/PinPad.svelte"

	import { enhance } from "$app/forms"

	import { firstError } from "#lib/shared/form"

	import type { PageProps } from "./$types"

	let { data, form }: PageProps = $props()

	let pin = $state("")
	let error = $state<string | null>(null)
	let formEl: HTMLFormElement | null = $state(null)

	const locked = $derived((data.lockedUntil ?? 0) > Date.now())

	$effect(() => {
		if (!form) return
		error = form.success ? null : firstError(form)
		pin = ""
	})

	function submit() {
		if (pin.length === 8) formEl?.requestSubmit()
	}
</script>

<div class="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-neutral-100 px-6 pb-8">
	<div
		class="flex flex-1 flex-col items-center justify-center"
		style="padding-top: env(safe-area-inset-top)"
	>
		<span
			class="flex size-14 items-center justify-center rounded-3xl bg-primary-600 text-white shadow-sm"
		>
			<Lock size={24} />
		</span>

		{#if data.dbError}
			<h1 class="mt-4 text-lg font-extrabold tracking-tight">Sin conexión con la base</h1>
			<p class="mt-2 max-w-xs text-center text-sm text-neutral-500">
				No pudimos consultar la base de datos. A veces la primera carga tras un rato de inactividad
				tarda; vuelve a intentarlo.
			</p>
			<button
				type="button"
				onclick={() => window.location.reload()}
				class="mt-5 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
			>
				Reintentar
			</button>
		{:else if !data.configured}
			<h1 class="mt-4 text-lg font-extrabold tracking-tight">App no inicializada</h1>
			<p class="mt-2 max-w-xs text-center text-sm text-neutral-500">
				Todavía no hay un PIN configurado. Corre
				<code class="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">pnpm pin:set</code>
				apuntando a esta base.
			</p>
		{:else}
			<h1 class="mt-4 text-lg font-extrabold tracking-tight">Ingresa tu PIN</h1>
			<p class="mt-1 text-xs text-neutral-400">8 dígitos</p>

			<form
				bind:this={formEl}
				method="POST"
				use:enhance={({ formData }) => {
					// The hidden state is set here (not via an input) so the value is
					// always fresh when the pad auto-submits.
					formData.set("pin", pin)
					return async ({ result, update }) => {
						if (result.type === "failure") pin = ""
						await update()
					}
				}}
				class="mt-6 w-full"
			>
				<PinPad bind:value={pin} oncomplete={submit} disabled={locked} />
			</form>

			{#if error}
				<p class="mt-4 text-sm font-medium text-red-600">{error}</p>
			{/if}
		{/if}
	</div>
</div>
