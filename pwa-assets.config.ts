import { defineConfig, minimal2023Preset as preset } from "@vite-pwa/assets-generator/config"

// Brand color, kept in sync with `DEFAULT_ACCENT` in src/lib/settings/settings.svelte.ts.
const brand = "#6300a6"

// Generates the PWA icons in `static/` from `static/logo.svg` (run: pnpm pwa:assets).
export default defineConfig({
	headLinkOptions: { preset: "2023" },
	preset: {
		...preset,
		maskable: { sizes: [512], resizeOptions: { background: brand } },
		apple: { sizes: [180], resizeOptions: { background: brand } },
	},
	images: ["static/logo.svg"],
})
