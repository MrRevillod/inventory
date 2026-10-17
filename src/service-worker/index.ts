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

self.addEventListener("fetch", (event) => {
	const { request } = event

	// Only same-origin GETs; everything else goes straight to the network.
	if (request.method !== "GET") return
	if (new URL(request.url).origin !== self.location.origin) return

	event.respondWith(respond(request))
})

async function respond(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const cache = await caches.open(CACHE)

	// Build output and static files never change within a deployment: cache-first.
	if (PRECACHE.includes(url.pathname)) {
		const cached = await cache.match(url.pathname)
		if (cached) return cached
	}

	// Navigations: network-first so data is always fresh, with the offline
	// page as the fallback.
	if (request.mode === "navigate") {
		try {
			return await fetch(request)
		} catch {
			const offline = await cache.match(OFFLINE)
			if (offline) return offline
			return new Response("Sin conexión", {
				status: 503,
				headers: { "content-type": "text/plain; charset=utf-8" },
			})
		}
	}

	// Everything else (load data, form actions): network only. A POS must never
	// serve stale sales or inventory.
	return fetch(request)
}
