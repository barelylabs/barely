// function to make string title case
function toTitleCase(str: string) {
	return str.replace(
		/\w\S*/g,
		txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
	);
}

export { toTitleCase };
