// Draws a sale receipt to a canvas and returns it as a PNG blob. Client-only:
// it needs the DOM. No dependencies — the layout is plain Canvas 2D.

import { Money } from "#lib/shared/value-objects/money.value"
import { DateTime } from "#lib/shared/value-objects/date.value"

import type { ReceiptData } from "./dtos"

const WIDTH = 640
const PADDING = 56
const SCALE = 2

/** Header block (store name + subtitle/date + rule spacing), from `PADDING`. */
const HEADER = 120
/** Vertical space each line gets; the extra is the gap to the next item. */
const ITEM_HEIGHT = 84
/** Smallest gap kept between the last item and the total rule. */
const MIN_GAP_AFTER_ITEMS = 24
const RULE_TO_TOTAL = 44
const TOTAL_TO_FOOTER = 46
/** Keeps a 1–2 item sale portrait so it fills the sheet height. */
const MIN_HEIGHT = 800

const BOTTOM = MIN_GAP_AFTER_ITEMS + RULE_TO_TOTAL + TOTAL_TO_FOOTER + PADDING

const FONT_FAMILY = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
const INK = "#111111"
const MUTED = "#6b7280"
const RULE = "#e5e7eb"

function setFont(ctx: CanvasRenderingContext2D, weight: number, size: number): void {
	ctx.font = `${weight} ${size}px ${FONT_FAMILY}`
	// Some engines reject the family list; fall back so text is never tiny.
	if (!ctx.font.includes(`${size}px`)) ctx.font = `${weight} ${size}px sans-serif`
}

/** Shrinks text with an ellipsis until it fits. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	if (ctx.measureText(text).width <= maxWidth) return text
	let cut = text
	while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
		cut = cut.slice(0, -1)
	}
	return `${cut}…`
}

function rule(ctx: CanvasRenderingContext2D, y: number, right: number): void {
	ctx.strokeStyle = RULE
	ctx.lineWidth = 2
	ctx.beginPath()
	ctx.moveTo(PADDING, y)
	ctx.lineTo(right, y)
	ctx.stroke()
}

/** Renders the receipt as a PNG. */
export async function renderReceipt(data: ReceiptData): Promise<Blob> {
	const canvas = document.createElement("canvas")
	const itemsTop = PADDING + HEADER
	const itemsEnd = itemsTop + data.items.length * ITEM_HEIGHT
	const height = Math.max(MIN_HEIGHT, itemsEnd + BOTTOM)

	canvas.width = WIDTH * SCALE
	canvas.height = height * SCALE

	const ctx = canvas.getContext("2d")
	if (!ctx) throw new Error("No se pudo preparar el lienzo")

	ctx.scale(SCALE, SCALE)
	ctx.fillStyle = "#ffffff"
	ctx.fillRect(0, 0, WIDTH, height)
	ctx.textBaseline = "alphabetic"

	const right = WIDTH - PADDING
	const footerY = height - PADDING
	const totalY = footerY - TOTAL_TO_FOOTER
	const ruleY = totalY - RULE_TO_TOTAL

	// Header.
	let y = PADDING
	setFont(ctx, 700, 36)
	ctx.fillStyle = INK
	ctx.textAlign = "left"
	ctx.fillText(fit(ctx, data.storeName || "inventory", WIDTH - PADDING * 2), PADDING, y + 34)

	y += 50
	setFont(ctx, 400, 20)
	ctx.fillStyle = MUTED
	ctx.fillText("Boleta de venta", PADDING, y + 18)
	ctx.textAlign = "right"
	ctx.fillText(DateTime.format(data.createdAt), right, y + 18)
	ctx.textAlign = "left"

	y += 34
	rule(ctx, y, right)

	// Items, right under the header. The leftover space (short sales) stays as a
	// single gap before the total, which is how a receipt reads.
	y = itemsTop

	for (const item of data.items) {
		const lineTotal = Money.format(item.price * item.quantity)

		setFont(ctx, 700, 24)
		ctx.fillStyle = INK
		ctx.textAlign = "right"
		const totalWidth = ctx.measureText(lineTotal).width
		ctx.textAlign = "left"
		ctx.fillText(fit(ctx, item.name, WIDTH - PADDING * 2 - totalWidth - 24), PADDING, y + 26)
		ctx.textAlign = "right"
		ctx.fillText(lineTotal, right, y + 26)
		ctx.textAlign = "left"

		y += 32
		setFont(ctx, 400, 20)
		ctx.fillStyle = MUTED
		ctx.fillText(`${item.quantity} × ${Money.format(item.price)}`, PADDING, y + 20)

		y += ITEM_HEIGHT - 32
	}

	// Total and footer, anchored to the bottom.
	rule(ctx, ruleY, right)

	setFont(ctx, 700, 22)
	ctx.fillStyle = MUTED
	ctx.fillText("TOTAL", PADDING, totalY + 30)
	setFont(ctx, 800, 40)
	ctx.fillStyle = data.accent
	ctx.textAlign = "right"
	ctx.fillText(Money.format(data.total), right, totalY + 30)
	ctx.textAlign = "left"

	setFont(ctx, 400, 20)
	ctx.fillStyle = MUTED
	ctx.textAlign = "center"
	ctx.fillText("¡Gracias por tu compra!", WIDTH / 2, footerY)
	ctx.textAlign = "left"

	return await new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob)
			else reject(new Error("No se pudo generar la imagen"))
		}, "image/png")
	})
}

/** e.g. `boleta-20261017-2145.png`. */
export function receiptFilename(createdAt: string): string {
	const date = new Date(createdAt)
	const pad = (value: number) => String(value).padStart(2, "0")
	const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
	return `boleta-${stamp}-${pad(date.getHours())}${pad(date.getMinutes())}.png`
}
