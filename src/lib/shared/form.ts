import { toasts } from "#lib/shared/toast.svelte"

import type { SubmitFunction } from "$app/forms"

export function firstError(payload: unknown): string {
	const errors = (payload as { errors?: Record<string, string[]> })?.errors
	const first = errors ? Object.values(errors).flat()[0] : undefined
	return first ?? "Revisa los datos"
}

/** Shared `use:enhance` submit handler: shows errors / a success toast, then updates. */
export function formHandler(onSuccess: () => void, message: string): SubmitFunction {
	return () =>
		async ({ result, update }) => {
			if (result.type === "failure") {
				toasts.show(firstError(result.data), "error")
			} else if (result.type === "success") {
				onSuccess()
				toasts.show(message, "success")
			}
			await update()
		}
}
