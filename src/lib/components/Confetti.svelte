<script lang="ts">
	import { confetti } from "#lib/confetti.svelte"
	import { settings } from "#lib/settings.svelte"
	import { browser } from "$app/env"

	interface Particle {
		id: number
		x: number
		drift: number
		delay: number
		color: string
		size: number
		rotate: number
	}

	let particles = $state<Particle[]>([])
	let nextId = 0
	let timer: ReturnType<typeof setTimeout> | undefined

	$effect(() => {
		const burst = confetti.burst
		if (!browser || burst === 0) return
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

		const palette = [settings.value.accent, "#fbbf24", "#f472b6", "#34d399", "#60a5fa"]

		particles = Array.from({ length: 28 }, () => ({
			id: nextId++,
			x: 15 + Math.random() * 70,
			drift: (Math.random() - 0.5) * 200,
			delay: Math.random() * 140,
			color: palette[Math.floor(Math.random() * palette.length)],
			size: 6 + Math.random() * 6,
			rotate: Math.random() * 360,
		}))

		clearTimeout(timer)
		timer = setTimeout(() => {
			particles = []
		}, 1500)
	})
</script>

<div class="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
	{#each particles as p (p.id)}
		<span
			class="confetti-particle"
			style="left: {p.x}%; --drift: {p.drift}px; --delay: {p.delay}ms; --rot: {p.rotate}deg; width: {p.size}px; height: {p.size *
				1.5}px; background: {p.color}"
		></span>
	{/each}
</div>
