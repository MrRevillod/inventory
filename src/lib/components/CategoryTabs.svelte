<script lang="ts">
	import Layers from "@lucide/svelte/icons/layers"
	import CategoryIcon from "./CategoryIcon.svelte"

	let {
		items,
		active,
		onselect,
		onmanage,
	}: {
		items: { id: string; name: string; icon: string }[]
		active: string | null
		onselect: (id: string) => void
		onmanage?: () => void
	} = $props()

	let scroller = $state<HTMLDivElement | null>(null)
	let overflow = $state(false)
	let atEnd = $state(true)

	const showEndFade = $derived(overflow && !atEnd)

	function measure() {
		if (!scroller) return
		overflow = scroller.scrollWidth > scroller.clientWidth + 1
		atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2
	}

	/** Svelte action: runs on mount, when the node and its layout exist. */
	function observe(node: HTMLDivElement) {
		scroller = node
		measure()
		const resize = new ResizeObserver(measure)
		resize.observe(node)
		const mutation = new MutationObserver(measure)
		mutation.observe(node, { childList: true })
		return {
			destroy() {
				resize.disconnect()
				mutation.disconnect()
			},
		}
	}
</script>

<div class="flex items-center gap-2 px-5 py-3">
	<div class="relative min-w-0 flex-1">
		<div
			use:observe
			onscroll={measure}
			class="flex gap-2 overflow-x-auto pr-1 [scrollbar-width:none]"
		>
			{#each items as item (item.id)}
				{@const isActive = active === item.id}
				<button
					type="button"
					onclick={() => onselect(item.id)}
					class="flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-semibold transition-colors {isActive
						? "bg-primary-600 text-white shadow-sm"
						: "bg-white text-neutral-600 ring-1 ring-neutral-200"}"
				>
					<CategoryIcon name={item.icon} size={16} />
					{item.name}
				</button>
			{/each}
		</div>
		{#if showEndFade}
			<div
				class="pointer-events-none absolute inset-y-0 right-0 w-10"
				style="background: linear-gradient(to left, var(--color-neutral-100), transparent)"
			></div>
		{/if}
	</div>
	{#if onmanage}
		<button
			type="button"
			onclick={onmanage}
			aria-label="Gestionar categorías"
			class="flex size-9 shrink-0 items-center justify-center rounded-pill bg-primary-600 text-white shadow-sm transition-transform active:scale-90"
		>
			<Layers size={18} />
		</button>
	{/if}
</div>
