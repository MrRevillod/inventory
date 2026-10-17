// Thin wrappers over the Web Share API. Sharing *files* needs HTTPS, a user
// gesture (transient activation) and a browser that supports it — always check
// `canShareImage` first and keep a download fallback.

export type ShareOutcome = "shared" | "cancelled" | "unsupported" | "failed"

function toFile(blob: Blob, filename: string): File {
	return new File([blob], filename, { type: blob.type || "application/octet-stream" })
}

/** Whether this browser can hand the blob to the native share sheet. */
export function canShareImage(blob: Blob, filename: string): boolean {
	if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false
	try {
		return navigator.canShare({ files: [toFile(blob, filename)] })
	} catch {
		return false
	}
}

/**
 * Opens the native share sheet. Returns "cancelled" when the user dismisses it
 * (not an error) and "unsupported"/"failed" when the caller should fall back to
 * downloading.
 */
export async function shareImage(
	blob: Blob,
	filename: string,
	text?: string,
): Promise<ShareOutcome> {
	if (!canShareImage(blob, filename)) return "unsupported"

	try {
		await navigator.share({ files: [toFile(blob, filename)], text })
		return "shared"
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") return "cancelled"
		return "failed"
	}
}

/** Saves the blob to disk. */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	document.body.append(link)
	link.click()
	link.remove()
	// Give the browser time to start the download before revoking.
	setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
