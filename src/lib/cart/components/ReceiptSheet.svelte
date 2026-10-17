<script lang="ts">
	import Check from "@lucide/svelte/icons/check"
	import Share2 from "@lucide/svelte/icons/share-2"
	import Download from "@lucide/svelte/icons/download"

	import BottomSheet from "#lib/shared/components/BottomSheet.svelte"

	import { Money } from "#lib/shared/value-objects/money.value"
	import { toasts } from "#lib/shared/toast.svelte"
	import { receiptFilename, renderReceipt } from "#lib/cart/receipt"
	import { canShareImage, downloadBlob, shareImage } from "#lib/shared/share"

	import type { ReceiptData } from "#lib/cart/dtos"

	let { receipt, onclose }: { receipt: ReceiptData | null; onclose: () => void } = $props()

	let blob = $state<Blob | null>(null)
	let preview = $state<string | null>(null)
	let shareable = $state(false)
	let drawing = $state(false)

	const filename = $derived(receipt ? receiptFilename(receipt.createdAt) : "boleta.png")

	$effect(() => {
		const data = receipt
		if (!data) return

		let url: string | null = null
		let stale = false
		drawing = true
		blob = null
		preview = null

		renderReceipt(data)
			.then((png) => {
				if (stale) return
				url = URL.createObjectURL(png)
				blob = png
				preview = url
				shareable = canShareImage(png, filename)
			})
			.catch((error) => {
				console.error("[receipt] no se pudo generar la imagen:", error)
				toasts.show("No se pudo generar la boleta", "error")
			})
			.finally(() => {
				if (!stale) drawing = false
			})

		return () => {
			stale = true
			if (url) URL.revokeObjectURL(url)
		}
	})

	async function share() {
		if (!blob) return
		const text = `Venta ${Money.format(receipt?.total ?? 0)}`
		const outcome = await shareImage(blob, filename, text)
		if (outcome === "failed") {
			toasts.show("No se pudo compartir, descargando la imagen", "error")
			downloadBlob(blob, filename)
		}
	}

	function download() {
		if (blob) downloadBlob(blob, filename)
	}

	/** Share when the platform can, download otherwise. */
	function primaryAction() {
		if (shareable) void share()
		else download()
	}
</script>

<BottomSheet open={receipt !== null} title="Boleta" {onclose}>
	<div class="flex min-h-[74dvh] flex-col">
		<div class="flex items-center justify-center gap-2 pb-3 text-sm font-semibold text-primary-600">
			<Check size={16} />
			Venta registrada
		</div>

		<div class="flex min-h-0 flex-1 items-start justify-center overflow-y-auto">
			{#if preview}
				<img
					src={preview}
					alt="Boleta de la venta"
					class="w-full rounded-2xl ring-1 ring-neutral-200/70"
				>
			{:else}
				<div
					class="flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-neutral-100 text-sm text-neutral-400"
				>
					{#if drawing}
						Generando imagen…
					{:else}
						Sin imagen
					{/if}
				</div>
			{/if}
		</div>

		<p class="pt-3 pb-2 text-center text-xs text-neutral-400">
			{shareable
				? "Elige WhatsApp u otra app en el menú de compartir."
				: "Puedes guardar la imagen y enviarla por tu cuenta."}
		</p>

		<div class="grid grid-cols-[auto_1fr] gap-2">
			<button
				type="button"
				onclick={onclose}
				class="rounded-2xl border border-neutral-200 px-6 py-3.5 text-sm font-semibold text-neutral-600 transition-colors active:bg-neutral-100"
			>
				Salir
			</button>
			<button
				type="button"
				onclick={primaryAction}
				disabled={!blob}
				class="flex items-center justify-center gap-2 rounded-2xl bg-primary-600 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-600/25 transition-transform active:scale-[0.98] disabled:opacity-40"
			>
				{#if shareable}
					<Share2 size={18} />
					Compartir
				{:else}
					<Download size={18} />
					Descargar
				{/if}
			</button>
		</div>
	</div>
</BottomSheet>
