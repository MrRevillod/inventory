<script lang="ts">
	import Delete from "@lucide/svelte/icons/delete"

	const LENGTH = 8
	const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"]

	let {
		value = $bindable(),
		oncomplete,
		disabled = false,
	}: {
		value: string
		oncomplete?: () => void
		disabled?: boolean
	} = $props()

	function press(key: string) {
		if (disabled) return

		if (key === "del") {
			value = value.slice(0, -1)
			return
		}

		if (!key || value.length >= LENGTH) return
		value += key
		if (value.length === LENGTH) oncomplete?.()
	}
</script>

<div class="flex justify-center gap-2.5" aria-hidden="true">
	{#each Array.from({ length: LENGTH }) as _, i (i)}
		<span
			class="size-3 rounded-pill transition-colors {i < value.length
				? "bg-primary-600"
				: "bg-neutral-300"}"
		></span>
	{/each}
</div>

<div class="mx-auto mt-8 grid w-full max-w-xs grid-cols-3 gap-3">
	{#each KEYS as key (key)}
		{#if key}
			<button
				type="button"
				onclick={() => press(key)}
				{disabled}
				aria-label={key === "del" ? "Borrar" : key}
				class="flex h-16 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-neutral-800 shadow-sm ring-1 ring-neutral-200/70 transition-transform active:scale-95 disabled:opacity-40"
			>
				{#if key === "del"}
					<Delete size={22} class="text-neutral-500" />
				{:else}
					{key}
				{/if}
			</button>
		{:else}
			<span></span>
		{/if}
	{/each}
</div>
