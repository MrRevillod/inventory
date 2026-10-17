<script lang="ts">
	import Plus from "@lucide/svelte/icons/plus"
	import Check from "@lucide/svelte/icons/check"
	import Minus from "@lucide/svelte/icons/minus"
	import Trash2 from "@lucide/svelte/icons/trash-2"
	import autoAnimate from "@formkit/auto-animate"
	import ShoppingBag from "@lucide/svelte/icons/shopping-bag"

	import BottomSheet from "#lib/shared/components/BottomSheet.svelte"
	import ReceiptSheet from "#lib/cart/components/ReceiptSheet.svelte"

	import { enhance } from "$app/forms"

	import { cart } from "#lib/cart/cart.svelte"
	import { Money } from "#lib/shared/value-objects/money.value"
	import { settings } from "#lib/settings/settings.svelte"
	import { confetti } from "#lib/shared/confetti.svelte"

	import type { ReceiptData, ReceiptItem } from "#lib/cart/dtos"

	/** Shape returned by the `?/checkout` action. */
	interface CheckoutPayload {
		success: boolean
		total: number
		items: ReceiptItem[]
		createdAt: string | null
	}

	let { open, onclose }: { open: boolean; onclose: () => void } = $props()

	let receipt = $state<ReceiptData | null>(null)
</script>

<BottomSheet {open} title="Carrito" {onclose}>
	<ul use:autoAnimate class="divide-y divide-neutral-100">
		{#each cart.items as item (item.id)}
			<li class="flex items-center gap-3 py-3">
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-semibold text-neutral-800">{item.name}</p>
					<p class="text-xs text-neutral-400 tabular-nums">{Money.format(item.price)} c/u</p>
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
					{Money.format(item.price * item.quantity)}
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
		<span class="text-2xl font-extrabold tabular-nums">{Money.format(cart.total)}</span>
	</div>

	<form
		method="POST"
		action="?/checkout"
		use:enhance={() =>
			async ({ result, update }) => {
				if (result.type === "success") {
					const payload = result.data as CheckoutPayload | undefined
					cart.clear()
					onclose()
					confetti.fire()
					if (payload?.createdAt) {
						receipt = {
							items: payload.items,
							total: payload.total,
							createdAt: payload.createdAt,
							storeName: settings.value.storeName,
							accent: settings.value.accent,
						}
					}
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
			onclose()
		}}
		disabled={cart.items.length === 0}
		class="mt-2 w-full rounded-2xl border border-primary-200 py-3.5 text-sm font-semibold text-primary-600 transition-colors active:bg-primary-50 disabled:opacity-40"
	>
		Cancelar atención
	</button>
</BottomSheet>

<ReceiptSheet {receipt} onclose={() => (receipt = null)} />
