const clp = new Intl.NumberFormat("es-CL", {
	style: "currency",
	currency: "CLP",
});

export const formatCLP = (amount: number) => clp.format(amount);
