<script lang="ts">
	import type { Snippet } from "svelte";
	import { fade, fly } from "svelte/transition";

	let {
		open = false,
		title,
		onclose,
		children,
	}: {
		open?: boolean;
		title?: string;
		onclose: () => void;
		children: Snippet;
	} = $props();

	// Lock background scroll while the sheet is open.
	$effect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previous;
		};
	});
</script>

<svelte:window onkeydown={(event) => event.key === "Escape" && open && onclose()} />

{#if open}
	<div class="fixed inset-0 z-50 mx-auto max-w-md">
		<button
			type="button"
			aria-label="Cerrar"
			onclick={onclose}
			transition:fade={{ duration: 150 }}
			class="absolute inset-0 h-full w-full bg-neutral-900/40 backdrop-blur-[2px]"
		></button>
		<div
			role="dialog"
			aria-modal="true"
			transition:fly={{ y: 420, duration: 300 }}
			class="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
			style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom))"
		>
			<div class="mx-auto mb-4 h-1.5 w-10 rounded-pill bg-neutral-200"></div>
			{#if title}
				<h2 class="mb-4 text-lg font-bold">{title}</h2>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}
