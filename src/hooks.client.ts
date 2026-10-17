import { dev } from "$app/env"

/**
 * SvelteKit never registers the service worker in development, so anything
 * found here is a leftover from an earlier build or `pnpm preview` run. It
 * cannot update itself — there is no `/service-worker.js` in dev — so it keeps
 * intercepting every request and ends up throwing `Failed to fetch` whenever
 * the dev server restarts. Drop it.
 */
export function init(): void {
	if (!dev || !("serviceWorker" in navigator)) return

	void navigator.serviceWorker.getRegistrations().then((registrations) => {
		for (const registration of registrations) void registration.unregister()
	})
}
