<script lang="ts">
	import ShoppingBag from "@lucide/svelte/icons/shopping-bag"

	import { fly } from "svelte/transition"

	import { Money } from "#lib/shared/value-objects/money.value"

	let { count, total, onopen }: { count: number; total: number; onopen: () => void } = $props()
</script>

{#if count > 0}
	<div
		class="fixed inset-x-0 z-30 mx-auto max-w-md px-5"
		style="bottom: calc(6.5rem + env(safe-area-inset-bottom))"
		transition:fly={{ y: 80, duration: 250 }}
	>
		<button
			type="button"
			onclick={onopen}
			class="flex w-full items-center gap-3 rounded-3xl bg-primary-600 px-4 py-3.5 text-white shadow-xl shadow-primary-600/30 transition-transform active:scale-[0.98]"
		>
			<span class="relative flex size-9 items-center justify-center rounded-pill bg-white/20">
				<ShoppingBag size={19} />
				<span
					class="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-pill bg-white px-1 text-[10px] font-bold text-primary-600"
				>
					{count}
				</span>
			</span>
			<span class="flex-1 text-left text-sm font-semibold">Ver carrito</span>
			<span class="text-base font-bold tabular-nums">{Money.format(total)}</span>
		</button>
	</div>
{/if}
