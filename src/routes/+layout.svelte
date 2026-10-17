<script lang="ts">
	import LoaderCircle from "@lucide/svelte/icons/loader-circle"
	import { fade } from "svelte/transition"
	import { cart } from "#lib/cart.svelte"
	import BottomNav from "#lib/components/BottomNav.svelte"
	import Confetti from "#lib/components/Confetti.svelte"
	import Toasts from "#lib/components/Toasts.svelte"
	import { settings } from "#lib/settings.svelte"
	import { onNavigate } from "$app/navigation"
	import "./layout.css"
	import favicon from "#lib/assets/favicon.svg"
	import type { LayoutProps } from "./$types"

	let { children }: LayoutProps = $props()

	let ready = $state(false)

	$effect(() => {
		cart.hydrate()
		settings.hydrate()
		// Keep the splash for at least ~0.5s from page load so it doesn't flicker.
		const timer = setTimeout(() => (ready = true), Math.max(0, 500 - performance.now()))
		return () => clearTimeout(timer)
	})

	onNavigate((navigation) => {
		if (!document.startViewTransition) return

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve()
				await navigation.complete
			})
		})
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon}>
</svelte:head>

<div class="mx-auto min-h-dvh max-w-md overflow-x-clip bg-neutral-100">
	{@render children()}
</div>
<BottomNav />
<Toasts />
<Confetti />

{#if !ready}
	<div
		transition:fade={{ duration: 250 }}
		class="fixed inset-0 z-[100] flex items-center justify-center bg-primary-600"
	>
		<LoaderCircle class="animate-spin text-white" size={32} />
	</div>
{/if}
