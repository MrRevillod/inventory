import { self } from "$app/service-worker"
import { version } from "$app/env"
import { resolve } from "$app/paths"
import { assets, immutable, prerendered } from "$app/manifest"

// One cache per deployment, so a new build starts from a clean slate.
const CACHE = `inventory-${version}`

// Paths in the manifest are relative to the base path, so resolve them to the
// absolute pathnames that show up in `url.pathname` inside `fetch`.
const PRECACHE = [
	...immutable.map((asset) => resolve(asset.path)),
	...assets.map((asset) => resolve(asset.path)),
	...prerendered.map((page) => resolve(page.path)),
]

const OFFLINE = resolve("/offline")

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)))
})

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key)
			}
		})(),
	)
})

// Only intercept what this worker owns: requests for precached output (build
// files and `static/`) and navigations. Everything else is deliberately left
// alone — passing a request through `respondWith` only adds latency and turns
// any hiccup into an uncaught "Failed to fetch".
self.addEventListener("fetch", (event) => {
	const { request } = event
	if (request.method !== "GET") return

	const url = new URL(request.url)
	if (url.origin !== self.location.origin) return

	if (PRECACHE.includes(url.pathname)) {
		event.respondWith(cacheFirst(url.pathname, request))
		return
	}

	if (request.mode === "navigate") {
		event.respondWith(navigate(request))
	}
})

/** Build output and static files never change within a deployment. */
async function cacheFirst(pathname: string, request: Request): Promise<Response> {
	const cache = await caches.open(CACHE)
	return (await cache.match(pathname)) ?? fetch(request)
}

/** Fresh data when online, the offline page when not. */
async function navigate(request: Request): Promise<Response> {
	try {
		return await fetch(request)
	} catch {
		const cache = await caches.open(CACHE)
		const offline = await cache.match(OFFLINE)
		if (offline) return offline
		return new Response("Sin conexión", {
			status: 503,
			headers: { "content-type": "text/plain; charset=utf-8" },
		})
	}
}
