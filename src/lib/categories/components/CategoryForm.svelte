<script lang="ts">
	import Tag from "@lucide/svelte/icons/tag"

	import BottomSheet from "#lib/shared/components/BottomSheet.svelte"

	import { enhance } from "$app/forms"

	import { formHandler } from "#lib/shared/form"
	import { categoryIconNames, categoryIcons, DEFAULT_ICON } from "../icons"

	let {
		open,
		id = null,
		initialName = "",
		initialIcon = DEFAULT_ICON,
		onclose,
	}: {
		open: boolean
		id?: string | null
		initialName?: string
		initialIcon?: string
		onclose: () => void
	} = $props()

	let name = $state("")
	let icon = $state<string>(DEFAULT_ICON)

	$effect(() => {
		if (open) {
			name = initialName
			icon = initialIcon
		}
	})
</script>

<BottomSheet {open} title={id ? "Editar categoría" : "Nueva categoría"} {onclose}>
	<form
		method="POST"
		action={id ? "?/updateCategory" : "?/addCategory"}
		use:enhance={formHandler(onclose, "Categoría guardada")}
		class="space-y-5"
	>
		{#if id}
			<input type="hidden" name="id" value={id}>
		{/if}
		<input type="hidden" name="icon" value={icon}>
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
				placeholder="Ej: Productos"
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
							? "bg-primary-600 text-white"
							: "bg-neutral-100 text-neutral-500"}"
					>
						<Icon size={18} />
					</button>
				{/each}
			</div>
		</div>
		<button
			type="submit"
			class="w-full rounded-2xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-transform active:scale-[0.98]"
		>
			{id ? "Guardar cambios" : "Agregar categoría"}
		</button>
	</form>
</BottomSheet>
