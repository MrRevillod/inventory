const clp = new Intl.NumberFormat("es-CL", {
	style: "currency",
	currency: "CLP",
})

export class Money {
	private constructor(private readonly amount: number) {}

	static from(value?: number | string | null): Money | null {
		const amount = typeof value === "string" ? Number(value) : value
		if (typeof amount !== "number" || !Number.isFinite(amount)) return null
		return new Money(amount)
	}

	static format(value?: number | string | null): string {
		return Money.from(value)?.toDisplay() ?? "--"
	}

	toDisplay(): string {
		return clp.format(this.amount)
	}
}
