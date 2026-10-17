<script lang="ts">
	import WifiOff from "@lucide/svelte/icons/wifi-off"
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 pb-28 text-center">
	<span
		class="flex size-16 items-center justify-center rounded-3xl bg-white text-neutral-400 shadow-sm ring-1 ring-neutral-200/70"
	>
		<WifiOff size={28} />
	</span>
	<h1 class="text-xl font-extrabold tracking-tight">Sin conexión</h1>
	<p class="max-w-xs text-sm text-neutral-500">
		No pudimos conectar con el servidor. Revisa tu red e inténtalo de nuevo.
	</p>
	<button
		type="button"
		onclick={() => window.location.reload()}
		class="mt-1 rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
	>
		Reintentar
	</button>
</div>
