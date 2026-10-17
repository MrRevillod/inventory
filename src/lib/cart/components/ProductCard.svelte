<script lang="ts">
	import Plus from "@lucide/svelte/icons/plus"

	import { Money } from "#lib/shared/value-objects/money.value"

	import type { CatalogProduct } from "#lib/products/dtos"

	let { product, color, onadd }: { product: CatalogProduct; color: string; onadd: () => void } =
		$props()
</script>

<button
	type="button"
	onclick={onadd}
	class="flex min-h-24 flex-col items-start gap-2 rounded-2xl bg-neutral-50 p-4 text-left ring-1 ring-neutral-200/60 transition-transform duration-150 active:scale-[0.96]"
>
	<span class="line-clamp-2 text-sm leading-snug font-semibold text-neutral-800"
		>{product.name}</span
	>
	<span class="mt-auto flex w-full items-center justify-between">
		<span class="text-sm font-bold tabular-nums" style="color: {color}"
			>{Money.format(product.price)}</span
		>
		<span
			class="flex size-6 items-center justify-center rounded-pill text-white"
			style="background: {color}"
		>
			<Plus size={14} />
		</span>
	</span>
</button>
