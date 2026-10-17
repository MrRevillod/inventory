<script lang="ts">
	import autoAnimate from "@formkit/auto-animate";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import Package from "@lucide/svelte/icons/package";
	import Pencil from "@lucide/svelte/icons/pencil";
	import Plus from "@lucide/svelte/icons/plus";
	import Tag from "@lucide/svelte/icons/tag";
	import Trash2 from "@lucide/svelte/icons/trash-2";
	import { untrack } from "svelte";
	import { slide } from "svelte/transition";
	import BottomSheet from "#lib/components/BottomSheet.svelte";
	import CategoryIcon from "#lib/components/CategoryIcon.svelte";
	import CategoryTabs from "#lib/components/CategoryTabs.svelte";
	import PageHeader from "#lib/components/PageHeader.svelte";
	import { categoryIconNames, categoryIcons, DEFAULT_ICON } from "#lib/icons";
	import { formatCLP } from "#lib/money";
	import { accentTones, tint } from "#lib/palette";
	import { settings } from "#lib/settings.svelte";
	import { toasts } from "#lib/toast.svelte";
	import { enhance, type SubmitFunction } from "$app/forms";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	let activeCategoryId = $state<string | null>(untrack(() => data.categories[0]?.id ?? null));
	let openSubcategory = $state<string | null>(null);

	let categorySheet = $state<{ id: string | null; name: string; icon: string } | null>(null);
	let subcategorySheet = $state<{
		id: string | null;
		name: string;
		icon: string;
		tone: number;
		categoryId: string;
	} | null>(null);
	let productSheet = $state<{
		id: string | null;
		name: string;
		price: string;
		subcategoryId: string;
	} | null>(null);
	let manageCategories = $state(false);
	let confirmDelete = $state<{ action: string; id: string; message: string } | null>(null);

	const tones = $derived(accentTones(settings.value.accent));
	const activeCategory = $derived(
		data.categories.find((category) => category.id === activeCategoryId) ??
			data.categories[0] ??
			null,
	);
	const subcategories = $derived(activeCategory?.subcategories ?? []);
	const currentOpen = $derived(openSubcategory ?? subcategories[0]?.id ?? null);
	const isOpen = (id: string) => currentOpen === id;

	function toggleSub(id: string) {
		openSubcategory = currentOpen === id ? "" : id;
	}

	function selectCategory(id: string) {
		activeCategoryId = id;
		openSubcategory = null;
	}

	function openCategoryCreate() {
		categorySheet = { id: null, name: "", icon: DEFAULT_ICON };
	}

	function openCategoryEdit(category: { id: string; name: string; icon: string }) {
		categorySheet = { id: category.id, name: category.name, icon: category.icon };
	}

	function openSubcategoryCreate() {
		if (!activeCategory) return;
		subcategorySheet = {
			id: null,
			name: "",
			icon: DEFAULT_ICON,
			tone: subcategories.length % 8,
			categoryId: activeCategory.id,
		};
	}

	function openSubcategoryEdit(sub: { id: string; name: string; icon: string; tone: number }) {
		subcategorySheet = {
			id: sub.id,
			name: sub.name,
			icon: sub.icon,
			tone: sub.tone,
			categoryId: activeCategoryId ?? "",
		};
	}

	function openProductCreate(subcategoryId: string) {
		productSheet = { id: null, name: "", price: "", subcategoryId };
	}

	function openProductEdit(product: {
		id: string;
		name: string;
		price: number;
		subcategoryId: string;
	}) {
		productSheet = {
			id: product.id,
			name: product.name,
			price: String(product.price),
			subcategoryId: product.subcategoryId,
		};
	}

	function setCategoryIcon(icon: string) {
		if (categorySheet) categorySheet.icon = icon;
	}

	function setSubcategoryIcon(icon: string) {
		if (subcategorySheet) subcategorySheet.icon = icon;
	}

	function setSubcategoryTone(tone: number) {
		if (subcategorySheet) subcategorySheet.tone = tone;
	}

	function firstError(payload: unknown): string {
		const errors = (payload as { errors?: Record<string, string[]> })?.errors;
		const first = errors ? Object.values(errors).flat()[0] : undefined;
		return first ?? "Revisa los datos";
	}

	function savedHandler(onSuccess: () => void, message: string): SubmitFunction {
		return () =>
			async ({ result, update }) => {
				if (result.type === "failure") {
					toasts.show(firstError(result.data), "error");
				} else if (result.type === "success") {
					onSuccess();
					toasts.show(message, "success");
				}
				await update();
			};
	}
</script>

<PageHeader title="Inventario" subtitle="Categorías y productos" icon={Package} />

<CategoryTabs
	items={data.categories}
	active={activeCategoryId}
	onselect={selectCategory}
	onmanage={() => (manageCategories = true)}
/>

<div use:autoAnimate class="space-y-3 px-5 pt-1 pb-28">
	{#each subcategories as sub (sub.id)}
		{@const color = tones[sub.tone] ?? tones[0]}
		<section class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200/70">
			<div class="flex items-center gap-1 px-3 py-2.5">
				<button
					type="button"
					onclick={() => toggleSub(sub.id)}
					class="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1 py-1 text-left"
				>
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-2xl"
						style="background: {tint(color, 0.12)}; color: {color}"
					>
						<CategoryIcon name={sub.icon} size={19} />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block truncate font-bold">{sub.name}</span>
						<span class="block text-xs text-neutral-400"
							>{sub.products.length}
							productos</span
						>
					</span>
					<ChevronDown
						size={18}
						class="shrink-0 text-neutral-300 transition-transform duration-200 {isOpen(
							sub.id,
						)
							? "rotate-180"
							: ""}"
					/>
				</button>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => openSubcategoryEdit(sub)}
						aria-label="Editar subcategoría"
						class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-neutral-100"
					>
						<Pencil size={16} />
					</button>
					<button
						type="button"
						onclick={() =>
							(confirmDelete = {
								action: "?/deleteSubcategory",
								id: sub.id,
								message: `Se eliminarán "${sub.name}" y todos sus productos.`,
							})}
						aria-label="Eliminar subcategoría"
						class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-red-50 active:text-red-500"
					>
						<Trash2 size={16} />
					</button>
					<button
						type="button"
						onclick={() => openProductCreate(sub.id)}
						aria-label="Agregar producto"
						class="flex size-8 items-center justify-center rounded-pill bg-primary-50 text-primary-600 transition-transform active:scale-90"
					>
						<Plus size={16} />
					</button>
				</div>
			</div>
			{#if isOpen(sub.id)}
				<ul
					transition:slide={{ duration: 200 }}
					class="divide-y divide-neutral-100 border-t border-neutral-100"
				>
					{#each sub.products as product (product.id)}
						<li class="flex items-center gap-2 px-4 py-3">
							<span class="min-w-0 flex-1 truncate text-sm text-neutral-700"
								>{product.name}</span
							>
							<span class="text-sm font-semibold text-neutral-800 tabular-nums">
								{formatCLP(product.price)}
							</span>
							<button
								type="button"
								onclick={() => openProductEdit(product)}
								aria-label="Editar producto"
								class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-neutral-100"
							>
								<Pencil size={15} />
							</button>
							<button
								type="button"
								onclick={() =>
									(confirmDelete = {
										action: "?/deleteProduct",
										id: product.id,
										message: `Se eliminará "${product.name}".`,
									})}
								aria-label="Eliminar producto"
								class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-red-50 active:text-red-500"
							>
								<Trash2 size={15} />
							</button>
						</li>
					{:else}
						<li class="px-4 py-4 text-sm text-neutral-400">
							No hay productos en esta subcategoría.
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else}
		<div
			class="flex flex-col items-center gap-2 rounded-3xl bg-white py-14 text-center ring-1 ring-neutral-200/70"
		>
			<Package size={30} class="text-neutral-300" />
			<p class="text-sm text-neutral-500">Esta categoría no tiene subcategorías.</p>
			<button
				type="button"
				onclick={openSubcategoryCreate}
				class="text-sm font-semibold text-primary-600"
			>
				Agregar la primera
			</button>
		</div>
	{/each}

	{#if subcategories.length > 0}
		<button
			type="button"
			onclick={openSubcategoryCreate}
			class="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-neutral-300 bg-white/60 py-3 text-sm font-semibold text-primary-600 transition-colors active:bg-primary-50"
		>
			<Plus size={16} />
			Nueva subcategoría
		</button>
	{/if}
</div>

<BottomSheet open={manageCategories} title="Categorías" onclose={() => (manageCategories = false)}>
	<ul class="divide-y divide-neutral-100">
		{#each data.categories as category (category.id)}
			<li class="flex items-center gap-3 py-3">
				<span
					class="flex size-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600"
				>
					<CategoryIcon name={category.icon} size={17} />
				</span>
				<span class="min-w-0 flex-1 truncate font-semibold">{category.name}</span>
				<button
					type="button"
					onclick={() => {
						manageCategories = false;
						openCategoryEdit(category);
					}}
					aria-label="Editar categoría"
					class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-neutral-100"
				>
					<Pencil size={15} />
				</button>
				<button
					type="button"
					onclick={() =>
						(confirmDelete = {
							action: "?/deleteCategory",
							id: category.id,
							message: `Se eliminará "${category.name}" con todas sus subcategorías y productos.`,
						})}
					aria-label="Eliminar categoría"
					class="flex size-8 items-center justify-center rounded-pill text-neutral-400 transition-colors active:bg-red-50 active:text-red-500"
				>
					<Trash2 size={15} />
				</button>
			</li>
		{/each}
	</ul>
	<button
		type="button"
		onclick={() => {
			manageCategories = false;
			openCategoryCreate();
		}}
		class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary-200 py-3 text-sm font-semibold text-primary-600 transition-colors active:bg-primary-50"
	>
		<Plus size={16} />
		Nueva categoría
	</button>
</BottomSheet>

<BottomSheet
	open={categorySheet !== null}
	title={categorySheet?.id ? "Editar categoría" : "Nueva categoría"}
	onclose={() => (categorySheet = null)}
>
	{#if categorySheet}
		<form
			method="POST"
			action={categorySheet.id ? "?/updateCategory" : "?/addCategory"}
			use:enhance={savedHandler(() => (categorySheet = null), "Categoría guardada")}
			class="space-y-5"
		>
			{#if categorySheet.id}
				<input type="hidden" name="id" value={categorySheet.id}>
			{/if}
			<input type="hidden" name="icon" value={categorySheet.icon}>
			<label class="block">
				<span
					class="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-700"
				>
					<Tag size={15} />
					Nombre
				</span>
				<input
					name="name"
					bind:value={categorySheet.name}
					required
					maxlength="60"
					placeholder="Ej: Productos"
					class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
				>
			</label>
			<div>
				<span class="mb-2 block text-sm font-semibold text-neutral-700">Ícono</span>
				<div class="grid grid-cols-6 gap-2">
					{#each categoryIconNames as iconName (iconName)}
						{@const Icon = categoryIcons[iconName]}
						<button
							type="button"
							onclick={() => setCategoryIcon(iconName)}
							aria-label={iconName}
							class="flex aspect-square items-center justify-center rounded-xl transition-colors {categorySheet.icon ===
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
				{categorySheet.id ? "Guardar cambios" : "Agregar categoría"}
			</button>
		</form>
	{/if}
</BottomSheet>

<BottomSheet
	open={subcategorySheet !== null}
	title={subcategorySheet?.id ? "Editar subcategoría" : "Nueva subcategoría"}
	onclose={() => (subcategorySheet = null)}
>
	{#if subcategorySheet}
		<form
			method="POST"
			action={subcategorySheet.id ? "?/updateSubcategory" : "?/addSubcategory"}
			use:enhance={savedHandler(() => (subcategorySheet = null), "Subcategoría guardada")}
			class="space-y-5"
		>
			{#if subcategorySheet.id}
				<input type="hidden" name="id" value={subcategorySheet.id}>
			{/if}
			<input type="hidden" name="icon" value={subcategorySheet.icon}>
			<input type="hidden" name="tone" value={subcategorySheet.tone}>
			<input type="hidden" name="categoryId" value={subcategorySheet.categoryId}>
			<label class="block">
				<span
					class="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-neutral-700"
				>
					<Tag size={15} />
					Nombre
				</span>
				<input
					name="name"
					bind:value={subcategorySheet.name}
					required
					maxlength="60"
					placeholder="Ej: Esmaltes"
					class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
				>
			</label>
			<div>
				<span class="mb-2 block text-sm font-semibold text-neutral-700">Ícono</span>
				<div class="grid grid-cols-6 gap-2">
					{#each categoryIconNames as iconName (iconName)}
						{@const Icon = categoryIcons[iconName]}
						<button
							type="button"
							onclick={() => setSubcategoryIcon(iconName)}
							aria-label={iconName}
							class="flex aspect-square items-center justify-center rounded-xl transition-colors {subcategorySheet.icon ===
							iconName
								? "text-white"
								: "bg-neutral-100 text-neutral-500"}"
							style={subcategorySheet.icon === iconName
								? `background: ${tones[subcategorySheet.tone] ?? tones[0]}`
								: ""}
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
							onclick={() => setSubcategoryTone(index)}
							aria-label={`Tono ${index + 1}`}
							class="size-9 rounded-pill ring-2 ring-offset-2 transition {subcategorySheet.tone ===
							index
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
				{subcategorySheet.id ? "Guardar cambios" : "Agregar subcategoría"}
			</button>
		</form>
	{/if}
</BottomSheet>

<BottomSheet
	open={productSheet !== null}
	title={productSheet?.id ? "Editar producto" : "Nuevo producto"}
	onclose={() => (productSheet = null)}
>
	{#if productSheet}
		<form
			method="POST"
			action={productSheet.id ? "?/updateProduct" : "?/addProduct"}
			use:enhance={savedHandler(() => (productSheet = null), "Producto guardado")}
			class="space-y-4"
		>
			{#if productSheet.id}
				<input type="hidden" name="id" value={productSheet.id}>
			{/if}
			<label class="block">
				<span class="mb-1.5 block text-sm font-semibold text-neutral-700">Nombre</span>
				<input
					name="name"
					bind:value={productSheet.name}
					required
					maxlength="100"
					placeholder="Nombre del producto"
					class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
				>
			</label>
			<label class="block">
				<span class="mb-1.5 block text-sm font-semibold text-neutral-700"
					>Precio (CLP)</span
				>
				<input
					name="price"
					type="number"
					min="1"
					step="1"
					required
					bind:value={productSheet.price}
					placeholder="10000"
					class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
				>
			</label>
			<label class="block">
				<span class="mb-1.5 block text-sm font-semibold text-neutral-700"
					>Subcategoría</span
				>
				<select
					name="subcategoryId"
					bind:value={productSheet.subcategoryId}
					class="w-full rounded-xl bg-neutral-100 px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-primary-300"
				>
					{#each data.categories as category (category.id)}
						<optgroup label={category.name}>
							{#each category.subcategories as sub (sub.id)}
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
				{productSheet.id ? "Guardar cambios" : "Agregar producto"}
			</button>
		</form>
	{/if}
</BottomSheet>

<BottomSheet
	open={confirmDelete !== null}
	title="Confirmar eliminación"
	onclose={() => (confirmDelete = null)}
>
	<p class="text-sm text-neutral-600">{confirmDelete?.message}</p>
	<form
		method="POST"
		action={confirmDelete?.action}
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.type === "success") {
					confirmDelete = null;
					toasts.show("Eliminado", "success");
				}
				await update();
			}}
		class="mt-5 flex gap-3"
	>
		<input type="hidden" name="id" value={confirmDelete?.id ?? ""}>
		<button
			type="button"
			onclick={() => (confirmDelete = null)}
			class="flex-1 rounded-2xl bg-neutral-100 py-3 font-semibold text-neutral-700 transition-transform active:scale-[0.98]"
		>
			Cancelar
		</button>
		<button
			type="submit"
			class="flex-1 rounded-2xl bg-red-600 py-3 font-semibold text-white transition-transform active:scale-[0.98]"
		>
			Eliminar
		</button>
	</form>
</BottomSheet>
