<script lang="ts">
	import X from "@lucide/svelte/icons/x"
	import Search from "@lucide/svelte/icons/search"
	import Sparkles from "@lucide/svelte/icons/sparkles"
	import autoAnimate from "@formkit/auto-animate"
	import ChevronDown from "@lucide/svelte/icons/chevron-down"

	import CartBar from "#lib/cart/components/CartBar.svelte"
	import CartSheet from "#lib/cart/components/CartSheet.svelte"
	import ProductCard from "#lib/cart/components/ProductCard.svelte"
	import CategoryIcon from "#lib/categories/components/CategoryIcon.svelte"
	import CategoryTabs from "#lib/categories/components/CategoryTabs.svelte"

	import { slide } from "svelte/transition"
	import { untrack } from "svelte"

	import { cart } from "#lib/cart/cart.svelte"
	import { toasts } from "#lib/shared/toast.svelte"
	import { settings } from "#lib/settings/settings.svelte"
	import { accentTones, tint } from "#lib/settings/palette"

	import type { PageProps } from "./$types"
	import type { CatalogProduct } from "#lib/products/dtos"

	let { data }: PageProps = $props()

	let search = $state("")
	let cartOpen = $state(false)
	let activeCategoryId = $state<string | null>(untrack(() => data.categories[0]?.id ?? null))
	let openSubcategory = $state<string | null>(null)

	const tones = $derived(accentTones(settings.value.accent))
	const searching = $derived(search.trim().length > 0)

	const activeCategory = $derived(
		data.categories.find((category) => category.id === activeCategoryId) ??
			data.categories[0] ??
			null,
	)

	const subcategories = $derived(
		(activeCategory?.subcategories ?? [])
			.map((sub) => ({
				...sub,
				products: sub.products.filter((product) =>
					product.name.toLowerCase().includes(search.trim().toLowerCase()),
				),
			}))
			.filter((sub) => sub.products.length > 0),
	)

	const currentOpen = $derived(openSubcategory ?? subcategories[0]?.id ?? null)
	const isOpen = (id: string) => searching || currentOpen === id

	function toggleSub(id: string) {
		if (searching) return
		openSubcategory = currentOpen === id ? "" : id
	}

	function selectCategory(id: string) {
		activeCategoryId = id
		openSubcategory = null
		search = ""
	}

	function add(product: CatalogProduct) {
		cart.add(product)
		toasts.show(`${product.name} agregado`, "success")
	}
</script>

<header class="sticky top-0 z-30 border-b border-neutral-200/70 bg-neutral-100/85 backdrop-blur-md">
	<div
		class="flex items-center gap-2.5 px-5 pb-3"
		style="padding-top: calc(1rem + env(safe-area-inset-top))"
	>
		<span
			class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm"
		>
			<Sparkles size={18} />
		</span>
		<div class="min-w-0 flex-1">
			<h1 class="truncate text-lg leading-tight font-extrabold tracking-tight">
				{settings.value.storeName || "pymeapp"}
			</h1>
			<p class="text-xs text-neutral-400">Punto de venta</p>
		</div>
	</div>
	<div class="px-5">
		<div
			class="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-sm ring-1 ring-neutral-200/70 focus-within:ring-2 focus-within:ring-primary-300"
		>
			<Search size={18} class="text-neutral-400" />
			<input
				bind:value={search}
				aria-label="Buscar producto"
				placeholder="Buscar producto"
				class="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
			>
			{#if search}
				<button
					type="button"
					onclick={() => (search = "")}
					aria-label="Limpiar búsqueda"
					class="text-neutral-400"
				>
					<X size={16} />
				</button>
			{/if}
		</div>
	</div>
	<CategoryTabs items={data.categories} active={activeCategoryId} onselect={selectCategory} />
</header>

<div use:autoAnimate class="space-y-3 px-5 pt-2 pb-44">
	{#each subcategories as sub (sub.id)}
		{@const color = tones[sub.tone] ?? tones[0]}
		<section class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200/70">
			<button
				type="button"
				onclick={() => toggleSub(sub.id)}
				class="flex w-full items-center gap-3 px-4 py-3.5 text-left"
			>
				<span
					class="flex size-10 shrink-0 items-center justify-center rounded-2xl"
					style="background: {tint(color, 0.12)}; color: {color}"
				>
					<CategoryIcon name={sub.icon} size={19} />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block truncate font-bold">{sub.name}</span>
					<span class="block text-xs text-neutral-400">{sub.products.length} productos</span>
				</span>
				<ChevronDown
					size={18}
					class="shrink-0 text-neutral-300 transition-transform duration-200 {isOpen(sub.id)
						? "rotate-180"
						: ""}"
				/>
			</button>
			{#if isOpen(sub.id)}
				<div transition:slide={{ duration: 200 }} class="border-t border-neutral-100 p-3">
					<div class="grid grid-cols-2 gap-3">
						{#each sub.products as product (product.id)}
							<ProductCard {product} {color} onadd={() => add(product)} />
						{/each}
					</div>
				</div>
			{/if}
		</section>
	{:else}
		<div
			class="flex flex-col items-center gap-2 rounded-3xl bg-white py-14 text-center ring-1 ring-neutral-200/70"
		>
			<Search size={28} class="text-neutral-300" />
			<p class="text-sm text-neutral-500">No encontramos productos</p>
			{#if search}
				<button
					type="button"
					onclick={() => (search = "")}
					class="text-sm font-semibold text-primary-600"
				>
					Limpiar búsqueda
				</button>
			{/if}
		</div>
	{/each}
</div>

<CartBar count={cart.count} total={cart.total} onopen={() => (cartOpen = true)} />
<CartSheet open={cartOpen} onclose={() => (cartOpen = false)} />
