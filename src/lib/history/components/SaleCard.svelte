<script lang="ts">
	import Receipt from "@lucide/svelte/icons/receipt"
	import Calendar from "@lucide/svelte/icons/calendar"
	import ChevronDown from "@lucide/svelte/icons/chevron-down"

	import { slide } from "svelte/transition"

	import { Money } from "#lib/shared/value-objects/money.value"
	import { DateTime } from "#lib/shared/value-objects/date.value"

	interface SaleWithItems {
		id: string
		total: number
		createdAt: Date | string
		items: { id: string; name: string; price: number; quantity: number }[]
	}

	let { sale, open, ontoggle }: { sale: SaleWithItems; open: boolean; ontoggle: () => void } =
		$props()
</script>

<article class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-neutral-200/70">
	<button
		type="button"
		onclick={ontoggle}
		class="flex w-full items-center gap-3 px-4 py-3.5 text-left"
	>
		<span
			class="flex size-10 shrink-0 items-center justify-center rounded-pill bg-primary-50 text-primary-600"
		>
			<Receipt size={18} />
		</span>
		<span class="min-w-0 flex-1">
			<span class="flex items-center gap-1.5 text-xs text-neutral-400">
				<Calendar size={12} /> {DateTime.format(sale.createdAt)}
			</span>
			<span class="block text-lg font-extrabold tabular-nums">{Money.format(sale.total)}</span>
		</span>
		<ChevronDown
			size={18}
			class="shrink-0 text-neutral-300 transition-transform duration-200 {open ? "rotate-180" : ""}"
		/>
	</button>
	{#if open}
		<ul
			transition:slide={{ duration: 200 }}
			class="divide-y divide-neutral-100 border-t border-neutral-100 px-4"
		>
			{#each sale.items as item (item.id)}
				<li class="flex items-center justify-between gap-3 py-2.5 text-sm">
					<span class="flex-1">{item.name}</span>
					<span class="text-neutral-400 tabular-nums"
						>{item.quantity}× {Money.format(item.price)}</span
					>
					<span class="w-20 text-right font-semibold tabular-nums">
						{Money.format(item.price * item.quantity)}
					</span>
				</li>
			{/each}
		</ul>
	{/if}
</article>
