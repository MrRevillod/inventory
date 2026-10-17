export const TIME_ZONE = "America/Santiago"

export type PeriodKey = "today" | "yesterday" | "week" | "month" | "all"

export const PERIODS: { key: PeriodKey; label: string }[] = [
	{ key: "today", label: "Hoy" },
	{ key: "yesterday", label: "Ayer" },
	{ key: "week", label: "7 días" },
	{ key: "month", label: "Este mes" },
	{ key: "all", label: "Todo" },
]

interface DateParts {
	year: number
	month: number
	day: number
}

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
})

function localParts(date: Date): DateParts {
	const [year, month, day] = partsFormatter.format(date).split("-").map(Number)
	return { year, month, day }
}

const offsetFormatter = new Intl.DateTimeFormat("en-US", {
	timeZone: TIME_ZONE,
	hour12: false,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
})

/** UTC instant for a wall-clock time in TIME_ZONE (handles DST via the offset). */
function zonedToUtc(year: number, month: number, day: number, hour = 0, minute = 0): Date {
	const guess = Date.UTC(year, month - 1, day, hour, minute)
	const parts: Record<string, number> = {}
	for (const part of offsetFormatter.formatToParts(new Date(guess))) {
		if (part.type !== "literal") parts[part.type] = Number(part.value)
	}
	const asUtc = Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour % 24,
		parts.minute,
		parts.second,
	)
	return new Date(guess - (asUtc - guess))
}

function shiftDay({ year, month, day }: DateParts, delta: number): DateParts {
	const shifted = new Date(Date.UTC(year, month - 1, day + delta))
	return {
		year: shifted.getUTCFullYear(),
		month: shifted.getUTCMonth() + 1,
		day: shifted.getUTCDate(),
	}
}

export function todayParts(): DateParts {
	return localParts(new Date())
}

export function monthKey(year: number, month: number): string {
	return `${year}-${String(month).padStart(2, "0")}`
}

export function parseMonthKey(value: string | null): { year: number; month: number } {
	if (value && /^\d{4}-\d{2}$/.test(value)) {
		const [year, month] = value.split("-").map(Number)
		return { year, month }
	}
	const now = todayParts()
	return { year: now.year, month: now.month }
}

export interface ResolvedPeriod {
	period: PeriodKey
	from: Date
	to: Date | null
	year: number
	month: number
}

export function resolvePeriod(
	periodParam: string | null,
	monthParam: string | null,
): ResolvedPeriod {
	const valid: PeriodKey[] = ["today", "yesterday", "week", "month", "all"]
	const period = valid.includes(periodParam as PeriodKey) ? (periodParam as PeriodKey) : "month"
	const today = todayParts()
	const anchor = parseMonthKey(monthParam)
	const startOfToday = zonedToUtc(today.year, today.month, today.day)
	const startOfTomorrowParts = shiftDay(today, 1)
	const startOfTomorrow = zonedToUtc(
		startOfTomorrowParts.year,
		startOfTomorrowParts.month,
		startOfTomorrowParts.day,
	)

	switch (period) {
		case "today":
			return {
				period,
				from: startOfToday,
				to: startOfTomorrow,
				year: today.year,
				month: today.month,
			}
		case "yesterday": {
			const y = shiftDay(today, -1)
			return {
				period,
				from: zonedToUtc(y.year, y.month, y.day),
				to: startOfToday,
				year: today.year,
				month: today.month,
			}
		}
		case "week": {
			const w = shiftDay(today, -6)
			return {
				period,
				from: zonedToUtc(w.year, w.month, w.day),
				to: startOfTomorrow,
				year: today.year,
				month: today.month,
			}
		}
		case "month": {
			const nextMonth = anchor.month === 12 ? 1 : anchor.month + 1
			const nextYear = anchor.month === 12 ? anchor.year + 1 : anchor.year
			return {
				period,
				from: zonedToUtc(anchor.year, anchor.month, 1),
				to: zonedToUtc(nextYear, nextMonth, 1),
				year: anchor.year,
				month: anchor.month,
			}
		}
		default:
			return {
				period: "all",
				from: new Date(0),
				to: null,
				year: today.year,
				month: today.month,
			}
	}
}

export function monthNav(
	year: number,
	month: number,
	delta: number,
): { year: number; month: number } {
	const shifted = new Date(Date.UTC(year, month - 1 + delta, 1))
	return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1 }
}

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
	timeZone: TIME_ZONE,
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
})

const headingFormatter = new Intl.DateTimeFormat("es-CL", {
	timeZone: TIME_ZONE,
	weekday: "long",
	day: "numeric",
	month: "long",
})

const monthFormatter = new Intl.DateTimeFormat("es-CL", {
	timeZone: TIME_ZONE,
	month: "long",
	year: "numeric",
})

function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

export function dayKey(date: Date | string): string {
	return dayKeyFormatter.format(new Date(date))
}

export function dayHeading(date: Date | string): string {
	return capitalize(headingFormatter.format(new Date(date)))
}

export function monthLabel(year: number, month: number): string {
	return capitalize(monthFormatter.format(zonedToUtc(year, month, 15)))
}
