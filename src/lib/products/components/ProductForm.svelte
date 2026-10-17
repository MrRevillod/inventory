<script lang="ts">
	import BottomSheet from "#lib/shared/components/BottomSheet.svelte"

	import { enhance } from "$app/forms"

	import { formHandler } from "#lib/shared/form"

	let {
		open,
		id = null,
		initialName = "",
		initialPrice = "",
		initialSubcategoryId = "",
		options,
		onclose,
	}: {
		open: boolean
		id?: string | null
		initialName?: string
		initialPrice?: string
		initialSubcategoryId?: string
		options: { category: string; subcategories: { id: string; name: string }[] }[]
		onclose: () => void
	} = $props()

	let name = $state("")
	let price = $state("")
	let subcategoryId = $state("")

	$effect(() => {
		if (open) {
			name = initialName
			price = initialPrice
			subcategoryId = initialSubcategoryId
		}
	})
</script>

<BottomSheet {open} title={id ? "Editar producto" : "Nuevo producto"} {onclose}>
	<form
		method="POST"
		action={id ? "?/updateProduct" : "?/addProduct"}
		use:enhance={formHandler(onclose, "Producto guardado")}
		class="space-y-4"
	>
		{#if id}
			<input type="hidden" name="id" value={id}>
		{/if}
		<label class="block">
			<span class="mb-1.5 block text-sm font-semibold text-neutral-700">Nombre</span>
			<input
				name="name"
				bind:value={name}
				required
				maxlength="100"
				placeholder="Nombre del producto"
				class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
			>
		</label>
		<label class="block">
			<span class="mb-1.5 block text-sm font-semibold text-neutral-700">Precio (CLP)</span>
			<input
				name="price"
				type="number"
				min="1"
				step="1"
				required
				bind:value={price}
				placeholder="10000"
				class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
			>
		</label>
		<label class="block">
			<span class="mb-1.5 block text-sm font-semibold text-neutral-700">Subcategoría</span>
			<select
				name="subcategoryId"
				bind:value={subcategoryId}
				class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
			>
				{#each options as group (group.category)}
					<optgroup label={group.category}>
						{#each group.subcategories as sub (sub.id)}
							<option value={sub.id}>{sub.name}</option>
						{/each}
					</optgroup>
				{/each}
			</select>
		</label>
		<button
			type="submit"
			class="w-full rounded-2xl bg-primary-600 py-3.5 font-bold text-white shadow-lg shadow-primary-600/20 transition-transform active:scale-[0.98]"
		>
			{id ? "Guardar cambios" : "Agregar producto"}
		</button>
	</form>
</BottomSheet>
