import { redirect } from "@sveltejs/kit"

import { isValidSession, SESSION_COOKIE } from "#lib/auth/session"

import type { Handle } from "@sveltejs/kit/hooks"

// Paths reachable without unlocking. `/pwa` and `/offline` are prerendered, so
// in production Vercel serves them as static files and never reaches the hook.
const PUBLIC_PATHS = ["/unlock", "/pwa", "/offline"]

const PUBLIC_FILES = new Set(["/robots.txt", "/manifest.webmanifest", "/service-worker.js"])

function isPublic(pathname: string): boolean {
	if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
		return true
	}
	if (PUBLIC_FILES.has(pathname)) return true
	// Static assets (icons, build output) never need the gate.
	return /\.(png|svg|ico|webmanifest|txt|webp|woff2?)$/.test(pathname)
}

export const handle: Handle = async ({ event, resolve }) => {
	if (isPublic(event.url.pathname)) return resolve(event)
	if (isValidSession(event.cookies.get(SESSION_COOKIE))) return resolve(event)

	// Form actions and data requests: refuse instead of redirecting a POST.
	if (event.request.method !== "GET") {
		return new Response("Bloqueado", { status: 401 })
	}

	const to = event.url.pathname + event.url.search
	redirect(303, `/unlock?redirectTo=${encodeURIComponent(to)}`)
}
