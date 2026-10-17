export const ACCENT_PRESETS = [
	"#6300a6",
	"#7c3aed",
	"#4f46e5",
	"#0284c7",
	"#0d9488",
	"#16a34a",
	"#d97706",
	"#ea580c",
	"#e11d48",
	"#db2777",
] as const;

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

const WHITE = { r: 255, g: 255, b: 255 };
const BLACK = { r: 0, g: 0, b: 0 };

function parseHex(hex: string) {
	const value = hex.replace("#", "");
	return {
		r: Number.parseInt(value.slice(0, 2), 16),
		g: Number.parseInt(value.slice(2, 4), 16),
		b: Number.parseInt(value.slice(4, 6), 16),
	};
}

function toHex({ r, g, b }: { r: number; g: number; b: number }) {
	const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
	return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

function mix(hex: string, target: { r: number; g: number; b: number }, amount: number) {
	const c = parseHex(hex);
	return toHex({
		r: c.r + (target.r - c.r) * amount,
		g: c.g + (target.g - c.g) * amount,
		b: c.b + (target.b - c.b) * amount,
	});
}

export function isHexColor(value: string) {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Derive a 50..900 Tailwind-style scale from one hex color. */
export function accentScale(hex: string): Record<Shade, string> {
	const base = isHexColor(hex) ? hex : "#6300a6";
	return {
		50: mix(base, WHITE, 0.94),
		100: mix(base, WHITE, 0.88),
		200: mix(base, WHITE, 0.74),
		300: mix(base, WHITE, 0.56),
		400: mix(base, WHITE, 0.34),
		500: mix(base, WHITE, 0.16),
		600: base,
		700: mix(base, BLACK, 0.16),
		800: mix(base, BLACK, 0.3),
		900: mix(base, BLACK, 0.44),
	};
}

/** Soft tint of a hex color, e.g. `tint("#6300a6", 0.1)` → 10% alpha. */
export function tint(hex: string, alpha: number) {
	const safe = isHexColor(hex) ? hex : "#6300a6";
	const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
		.toString(16)
		.padStart(2, "0");
	return `${safe}${a}`;
}

export const TONE_COUNT = 8;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function hexToHsl(hex: string) {
	const { r, g, b } = parseHex(hex);
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const d = max - min;
	let h = 0;
	let s = 0;

	if (d !== 0) {
		s = d / (1 - Math.abs(2 * l - 1));
		if (max === rn) h = ((gn - bn) / d) % 6;
		else if (max === gn) h = (bn - rn) / d + 2;
		else h = (rn - gn) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}

	return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
	const sn = s / 100;
	const ln = l / 100;
	const c = (1 - Math.abs(2 * ln - 1)) * sn;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = ln - c / 2;
	let rgb: [number, number, number];

	if (h < 60) rgb = [c, x, 0];
	else if (h < 120) rgb = [x, c, 0];
	else if (h < 180) rgb = [0, c, x];
	else if (h < 240) rgb = [0, x, c];
	else if (h < 300) rgb = [x, 0, c];
	else rgb = [c, 0, x];

	return toHex({ r: (rgb[0] + m) * 255, g: (rgb[1] + m) * 255, b: (rgb[2] + m) * 255 });
}

const TONE_HUES = [0, 14, -14, 28, -28, 7, -7, 20];
const TONE_LIGHT = [0, 4, -4, 8, -8, 12, -12, -14];

/**
 * 8 analogous colors derived from the accent, for category theming. Changing
 * the accent re-themes every category that references a tone.
 */
export function accentTones(hex: string): string[] {
	const base = isHexColor(hex) ? hex : "#6300a6";
	const { h, s, l } = hexToHsl(base);
	return TONE_HUES.map((deltaHue, i) => {
		const hue = (h + deltaHue + 360) % 360;
		const sat = clamp(s, 50, 88);
		const light = clamp(l + TONE_LIGHT[i], 32, 66);
		return hslToHex(hue, sat, light);
	});
}
