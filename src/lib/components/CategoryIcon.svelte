<script lang="ts">
	import { getCategoryIcon } from "#lib/icons"

	let {
		name,
		size = 18,
		color,
		strokeWidth = 2,
	}: { name: string; size?: number; color?: string; strokeWidth?: number } = $props()

	const Icon = $derived(getCategoryIcon(name))
</script>

<Icon {size} {color} {strokeWidth} />
