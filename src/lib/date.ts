const dateTime = new Intl.DateTimeFormat("es-CL", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

export const formatDateTime = (date: Date | string) => dateTime.format(new Date(date));
