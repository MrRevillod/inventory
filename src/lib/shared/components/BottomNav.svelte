<script lang="ts">
	import History from "@lucide/svelte/icons/history"
	import Package from "@lucide/svelte/icons/package"
	import Settings from "@lucide/svelte/icons/settings"
	import ShoppingCart from "@lucide/svelte/icons/shopping-cart"

	import { page } from "$app/state"

	import { cart } from "#lib/cart/cart.svelte"

	const links = [
		{ href: "/", label: "Vender", icon: ShoppingCart },
		{ href: "/inventory", label: "Inventario", icon: Package },
		{ href: "/history", label: "Historial", icon: History },
		{ href: "/settings", label: "Ajustes", icon: Settings },
	]

	const isActive = (href: string) =>
		href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href)
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-neutral-200/70 bg-white/85 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] backdrop-blur-lg"
	style="padding-bottom: env(safe-area-inset-bottom)"
>
	<ul class="grid grid-cols-4">
		{#each links as { href, label, icon } (href)}
			{@const Icon = icon}
			{@const active = isActive(href)}
			<li>
				<a
					{href}
					class="group flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[11px] font-medium transition-colors {active
						? "text-primary-600"
						: "text-neutral-400 hover:text-neutral-600"}"
				>
					<span
						class="relative flex size-9 items-center justify-center rounded-2xl transition-all duration-200 {active
							? "bg-primary-50"
							: "group-active:scale-90"}"
					>
						<Icon size={20} strokeWidth={active ? 2.5 : 1.9} />
						{#if href === "/" && cart.count > 0}
							{#key cart.count}
								<span
									class="absolute -top-0.5 -right-0.5 flex min-w-[18px] animate-pop items-center justify-center rounded-pill bg-primary-600 px-1 text-[10px] font-bold text-white"
								>
									{cart.count}
								</span>
							{/key}
						{/if}
					</span>
					{label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
