import adapter from "@sveltejs/adapter-vercel"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
			},

			// Deployment target is Vercel. Server functions run on Node.js (not
			// Edge) because `pg` / `@prisma/adapter-pg` need TCP. `regions` is
			// pinned to the Prisma Postgres region (us-east-1) so the queries
			// don't pay a cross-region round trip.
			adapter: adapter({ regions: ["iad1"] }),

			// Only the offline page and the install page are static; the rest of
			// the app needs the database and stays server-rendered.
			prerender: {
				entries: ["/offline", "/pwa"],
				crawl: false,
			},
		}),
	],
})
