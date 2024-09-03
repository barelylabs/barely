export const EMAIL_VARIABLES = [
	{
		name: 'firstName',
		// match: '{firstName}',
		description: 'The first name of the fan',
	},
	{
		name: 'lastName',
		// match: '{lastName}',
		description: 'The last name of the fan',
	},
] as const;

export const EMAIL_VARIABLE_NAMES = EMAIL_VARIABLES.map(v => v.name);

export type EmailVariableName = (typeof EMAIL_VARIABLES)[number]['name'];
