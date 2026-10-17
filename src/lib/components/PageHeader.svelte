<script lang="ts">
	import type { Component, Snippet } from "svelte";

	let {
		title,
		subtitle,
		icon: Icon,
		children,
	}: {
		title: string;
		subtitle?: string;
		icon?: Component;
		children?: Snippet;
	} = $props();
</script>

<header class="sticky top-0 z-30 border-b border-neutral-200/70 bg-neutral-100/85 backdrop-blur-md">
	<div
		class="flex items-center gap-2.5 px-5 pb-3"
		style="padding-top: calc(1rem + env(safe-area-inset-top))"
	>
		{#if Icon}
			<span
				class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-sm"
			>
				<Icon size={18} />
			</span>
		{/if}
		<div class="min-w-0 flex-1">
			<h1 class="truncate text-lg leading-tight font-extrabold tracking-tight">{title}</h1>
			{#if subtitle}
				<p class="text-xs text-neutral-400">{subtitle}</p>
			{/if}
		</div>
		{@render children?.()}
	</div>
</header>
