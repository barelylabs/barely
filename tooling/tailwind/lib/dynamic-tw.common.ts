export const shades = [
	50,
	...Array.from({ length: 9 }).map((_, i) => (i + 1) * 100),
	950,
];

export const makeVariable = ({
	fallbackValue,
	name,
	shade,
	withVar,
}: {
	fallbackValue?: string;
	name: string;
	shade?: number | string;
	withVar?: boolean;
}) => {
	const variable = `--${name}${shade ? `-${shade}` : ''}`;
	const value = fallbackValue ? variable + ', ' + fallbackValue : variable;
	return withVar ? `var(${value})` : variable;
};
