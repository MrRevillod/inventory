const dateTime = new Intl.DateTimeFormat("es-CL", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
})

export class DateTime {
	private constructor(private readonly date: Date) {}

	static from(value?: Date | string | null): DateTime | null {
		if (value === null || value === undefined || value === "") return null
		const date = value instanceof Date ? value : new Date(value)
		return Number.isNaN(date.getTime()) ? null : new DateTime(date)
	}

	static format(value?: Date | string | null): string {
		return DateTime.from(value)?.toDisplay() ?? "--"
	}

	toDisplay(): string {
		return dateTime.format(this.date)
	}
}
