<script lang="ts">
	import Tag from "@lucide/svelte/icons/tag"

	import BottomSheet from "#lib/shared/components/BottomSheet.svelte"

	import { enhance } from "$app/forms"

	import { settings } from "#lib/settings/settings.svelte"
	import { accentTones } from "#lib/settings/palette"
	import { formHandler } from "#lib/shared/form"
	import { categoryIconNames, categoryIcons, DEFAULT_ICON } from "../icons"

	let {
		open,
		id = null,
		initialName = "",
		initialIcon = DEFAULT_ICON,
		initialTone = 0,
		categoryId,
		onclose,
	}: {
		open: boolean
		id?: string | null
		initialName?: string
		initialIcon?: string
		initialTone?: number
		categoryId: string
		onclose: () => void
	} = $props()

	let name = $state("")
	let icon = $state<string>(DEFAULT_ICON)
	let tone = $state(0)

	const tones = $derived(accentTones(settings.value.accent))

	$effect(() => {
		if (open) {
			name = initialName
			icon = initialIcon
			tone = initialTone
		}
	})
</script>

<BottomSheet {open} title={id ? "Editar subcategoría" : "Nueva subcategoría"} {onclose}>
	<form
		method="POST"
		action={id ? "?/updateSubcategory" : "?/addSubcategory"}
		use:enhance={formHandler(onclose, "Subcategoría guardada")}
		class="space-y-5"
	>
		{#if id}
			<input type="hidden" name="id" value={id}>
		{/if}
		<input type="hidden" name="icon" value={icon}>
		<input type="hidden" name="tone" value={tone}>
		<input type="hidden" name="categoryId" value={categoryId}>
		<label class="block">
			<span class="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
				<Tag size={15} />
				Nombre
			</span>
			<input
				name="name"
				bind:value={name}
				required
				maxlength="60"
				placeholder="Ej: Esmaltes"
				class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
			>
		</label>
		<div>
			<span class="mb-2 block text-sm font-semibold text-neutral-700">Ícono</span>
			<div class="grid grid-cols-6 gap-2">
				{#each categoryIconNames as iconName (iconName)}
					{@const Icon = categoryIcons[iconName]}
					<button
						type="button"
						onclick={() => (icon = iconName)}
						aria-label={iconName}
						class="flex aspect-square items-center justify-center rounded-xl transition-colors {icon ===
						iconName
							? "text-white"
							: "bg-neutral-100 text-neutral-500"}"
						style={icon === iconName ? `background: ${tones[tone] ?? tones[0]}` : ""}
					>
						<Icon size={18} />
					</button>
				{/each}
			</div>
		</div>
		<div>
			<span class="mb-2 block text-sm font-semibold text-neutral-700">Tono</span>
			<div class="flex flex-wrap items-center gap-2.5">
				{#each tones as toneColor, index (index)}
					<button
						type="button"
						onclick={() => (tone = index)}
						aria-label={`Tono ${index + 1}`}
						class="size-9 rounded-pill ring-2 ring-offset-2 transition {tone === index
							? "ring-neutral-800"
							: "ring-transparent"}"
						style="background: {toneColor}"
					></button>
				{/each}
			</div>
		</div>
		<button
			type="submit"
			class="w-full rounded-2xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-transform active:scale-[0.98]"
		>
			{id ? "Guardar cambios" : "Agregar subcategoría"}
		</button>
	</form>
</BottomSheet>
