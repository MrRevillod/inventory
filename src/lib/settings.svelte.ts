import { browser } from "$app/env";
import { accentScale, isHexColor } from "./palette";

const STORAGE_KEY = "pymeapp:settings";

export type UiScale = "compact" | "normal" | "large";
export type RadiusProfile = "round" | "medium" | "square";

/** Radius tokens per profile. `round` matches the Tailwind defaults. */
export const RADIUS_PROFILES: Record<RadiusProfile, Record<string, string>> = {
	round: { lg: "0.5rem", xl: "0.75rem", "2xl": "1rem", "3xl": "1.5rem", pill: "9999px" },
	medium: { lg: "0.25rem", xl: "0.5rem", "2xl": "0.625rem", "3xl": "1rem", pill: "1rem" },
	square: { lg: "0", xl: "0", "2xl": "0", "3xl": "0", pill: "0" },
};

export interface Settings {
	storeName: string;
	accent: string;
	uiScale: UiScale;
	radius: RadiusProfile;
	palette: Record<string, string>;
}

export const DEFAULT_ACCENT = "#6300a6";

const SCALE_PX: Record<UiScale, string> = { compact: "15px", normal: "16px", large: "17.5px" };

/** Apply accent palette, UI scale and radius profile to the document. Client-only. */
export function applySettings(value: Settings) {
	if (!browser) return;
	const root = document.documentElement;
	for (const [shade, color] of Object.entries(value.palette)) {
		root.style.setProperty(`--color-primary-${shade}`, color);
	}
	root.style.setProperty("--color-primary", value.accent);
	root.style.fontSize = SCALE_PX[value.uiScale] ?? SCALE_PX.normal;
	const radius = RADIUS_PROFILES[value.radius] ?? RADIUS_PROFILES.round;
	for (const [key, size] of Object.entries(radius)) {
		root.style.setProperty(`--radius-${key}`, size);
	}
	document.querySelector('meta[name="theme-color"]')?.setAttribute("content", value.accent);
}

function build(partial: Partial<Settings>): Settings {
	const accent = partial.accent && isHexColor(partial.accent) ? partial.accent : DEFAULT_ACCENT;
	return {
		storeName: partial.storeName ?? "pymeapp",
		accent,
		uiScale: partial.uiScale ?? "normal",
		radius: partial.radius ?? "round",
		palette: accentScale(accent),
	};
}

function read(): Settings {
	if (!browser) return build({});
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return build(raw ? (JSON.parse(raw) as Partial<Settings>) : {});
	} catch {
		return build({});
	}
}

class SettingsStore {
	value = $state<Settings>(build({}));
	#hydrated = false;

	/** Load persisted settings and apply them. Call once from an effect. */
	hydrate() {
		if (this.#hydrated) return;
		this.#hydrated = true;
		const stored = read();
		this.value = stored;
		applySettings(stored);
	}

	patch(partial: Partial<Settings>) {
		this.value = build({ ...this.value, ...partial });
		this.#save();
	}

	reset() {
		this.value = build({});
		if (browser) localStorage.removeItem(STORAGE_KEY);
		applySettings(this.value);
	}

	#save() {
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
		applySettings(this.value);
	}
}

export const settings = new SettingsStore();
