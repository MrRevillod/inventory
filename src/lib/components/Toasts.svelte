<script lang="ts">
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import { fly } from "svelte/transition";
	import { toasts } from "#lib/toast.svelte";
</script>

<div
	class="pointer-events-none fixed inset-x-0 z-[60] mx-auto flex max-w-md flex-col items-center gap-2 px-4"
	style="bottom: calc(6rem + env(safe-area-inset-bottom))"
>
	{#each toasts.items as toast (toast.id)}
		<div
			transition:fly={{ y: 16, duration: 200 }}
			class="pointer-events-auto flex items-center gap-2 rounded-pill px-4 py-2.5 text-sm font-semibold text-white shadow-lg {toast.type ===
			"error"
				? "bg-red-600"
				: "bg-neutral-900/90"}"
		>
			{#if toast.type === "success"}
				<CircleCheck size={16} />
			{:else if toast.type === "error"}
				<CircleX size={16} />
			{/if}
			{toast.message}
		</div>
	{/each}
</div>
