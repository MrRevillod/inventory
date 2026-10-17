<script lang="ts">
	import autoAnimate from "@formkit/auto-animate"
	import Check from "@lucide/svelte/icons/check"
	import ChevronDown from "@lucide/svelte/icons/chevron-down"
	import Minus from "@lucide/svelte/icons/minus"
	import Plus from "@lucide/svelte/icons/plus"
	import Search from "@lucide/svelte/icons/search"
	import ShoppingBag from "@lucide/svelte/icons/shopping-bag"
	import Sparkles from "@lucide/svelte/icons/sparkles"
	import Trash2 from "@lucide/svelte/icons/trash-2"
	import X from "@lucide/svelte/icons/x"
	import { untrack } from "svelte"
	import { fly, slide } from "svelte/transition"
	import { cart } from "#lib/cart.svelte"
	import BottomSheet from "#lib/components/BottomSheet.svelte"
	import CategoryIcon from "#lib/components/CategoryIcon.svelte"
	import CategoryTabs from "#lib/components/CategoryTabs.svelte"
	import { confetti } from "#lib/confetti.svelte"
	import { formatCLP } from "#lib/money"
	import { accentTones, tint } from "#lib/palette"
	import { settings } from "#lib/settings.svelte"
	import { toasts } from "#lib/toast.svelte"
	import type { CatalogProduct } from "#lib/types"
	import { enhance } from "$app/forms"
	import type { PageProps } from "./$types"

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
					<span class="block text-xs text-neutral-400"
						>{sub.products.length}
						productos</span
					>
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
							<button
								type="button"
								onclick={() => add(product)}
								class="flex min-h-24 flex-col items-start gap-2 rounded-2xl bg-neutral-50 p-4 text-left ring-1 ring-neutral-200/60 transition-transform duration-150 active:scale-[0.96]"
							>
								<span class="line-clamp-2 text-sm leading-snug font-semibold text-neutral-800">
									{product.name}
								</span>
								<span class="mt-auto flex w-full items-center justify-between">
									<span class="text-sm font-bold tabular-nums" style="color: {color}">
										{formatCLP(product.price)}
									</span>
									<span
										class="flex size-6 items-center justify-center rounded-pill text-white"
										style="background: {color}"
									>
										<Plus size={14} />
									</span>
								</span>
							</button>
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

{#if cart.count > 0}
	<div
		class="fixed inset-x-0 z-30 mx-auto max-w-md px-5"
		style="bottom: calc(6.5rem + env(safe-area-inset-bottom))"
		transition:fly={{ y: 80, duration: 250 }}
	>
		<button
			type="button"
			onclick={() => (cartOpen = true)}
			class="flex w-full items-center gap-3 rounded-3xl bg-primary-600 px-4 py-3.5 text-white shadow-xl shadow-primary-600/30 transition-transform active:scale-[0.98]"
		>
			<span class="relative flex size-9 items-center justify-center rounded-pill bg-white/20">
				<ShoppingBag size={19} />
				<span
					class="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-pill bg-white px-1 text-[10px] font-bold text-primary-600"
				>
					{cart.count}
				</span>
			</span>
			<span class="flex-1 text-left text-sm font-semibold">Ver carrito</span>
			<span class="text-base font-bold tabular-nums">{formatCLP(cart.total)}</span>
		</button>
	</div>
{/if}

<BottomSheet open={cartOpen} title="Carrito" onclose={() => (cartOpen = false)}>
	<ul use:autoAnimate class="divide-y divide-neutral-100">
		{#each cart.items as item (item.id)}
			<li class="flex items-center gap-3 py-3">
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold text-neutral-800">{item.name}</p>
					<p class="text-xs text-neutral-400 tabular-nums">{formatCLP(item.price)} c/u</p>
				</div>
				<div class="flex items-center gap-0.5 rounded-pill bg-neutral-100 p-0.5">
					<button
						type="button"
						onclick={() => cart.decrement(item.id)}
						aria-label="Quitar uno"
						class="flex size-7 items-center justify-center rounded-pill text-neutral-600 transition-colors active:bg-white"
					>
						{#if item.quantity === 1}
							<Trash2 size={15} />
						{:else}
							<Minus size={15} />
						{/if}
					</button>
					<span class="w-6 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
					<button
						type="button"
						onclick={() => cart.add(item)}
						aria-label="Agregar uno"
						class="flex size-7 items-center justify-center rounded-pill text-neutral-600 transition-colors active:bg-white"
					>
						<Plus size={15} />
					</button>
				</div>
				<span class="w-20 text-right text-sm font-bold tabular-nums">
					{formatCLP(item.price * item.quantity)}
				</span>
			</li>
		{:else}
			<li class="flex flex-col items-center gap-2 py-10 text-center">
				<ShoppingBag size={28} class="text-neutral-300" />
				<p class="text-sm text-neutral-500">No hay productos en el carrito</p>
			</li>
		{/each}
	</ul>

	<div class="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
		<span class="text-sm text-neutral-500">Total</span>
		<span class="text-2xl font-extrabold tabular-nums">{formatCLP(cart.total)}</span>
	</div>

	<form
		method="POST"
		action="?/checkout"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.type === "success") {
					const total = cart.total
					cart.clear()
					cartOpen = false
					toasts.show(`Venta registrada · ${formatCLP(total)}`, "success")
					confetti.fire()
				}
				await update()
			}}
		class="mt-4"
	>
		<input type="hidden" name="cart" value={JSON.stringify(cart.items)}>
		<button
			type="submit"
			disabled={cart.items.length === 0}
			class="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 text-base font-bold text-white shadow-lg shadow-primary-600/25 transition-transform active:scale-[0.98] disabled:opacity-40"
		>
			<Check size={18} />
			Finalizar venta
		</button>
	</form>
	<button
		type="button"
		onclick={() => {
			cart.clear()
			cartOpen = false
		}}
		disabled={cart.items.length === 0}
		class="mt-2 w-full rounded-2xl border border-primary-200 py-3.5 text-sm font-semibold text-primary-600 transition-colors active:bg-primary-50 disabled:opacity-40"
	>
		Cancelar atención
	</button>
</BottomSheet>
