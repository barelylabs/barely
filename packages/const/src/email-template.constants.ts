export const EMAIL_TEMPLATE_VARIABLES = [
	{
		name: 'firstName',
		description: 'The first name of the fan',
	},
	{
		name: 'lastName',
		description: 'The last name of the fan',
	},
] as const;

export const EMAIL_TEMPLATE_VARIABLE_NAMES = EMAIL_TEMPLATE_VARIABLES.map(v => v.name);

export type EmailTemplateVariableName = (typeof EMAIL_TEMPLATE_VARIABLES)[number]['name'];
