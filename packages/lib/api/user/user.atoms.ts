import { fieldAtom } from 'form-atoms';
import { zodValidate, ZodValidateOn } from 'form-atoms/zod';
import { z, ZodError } from 'zod';

import { userContactInfoSchema } from './user.schema';

type ZodValidateWhen = 'dirty' | 'touched' | ('dirty' | 'touched')[] | undefined;

const stdZodValidateConfig = {
	on: ['blur', 'change'] satisfies ZodValidateOn[],
	when: ['touched'] satisfies ZodValidateWhen,
	formatError: (error: ZodError<unknown>) => error.issues.map(issue => issue.message),
};

const emailFieldAtom = fieldAtom({
	name: 'email',
	value: '',
	validate: zodValidate(userContactInfoSchema.shape.email, stdZodValidateConfig),
});

const firstNameFieldAtom = fieldAtom({
	name: 'firstName',
	value: '',
	validate: zodValidate(userContactInfoSchema.shape.firstName, stdZodValidateConfig),
});

const lastNameFieldAtom = fieldAtom({
	name: 'lastName',
	value: '',
	validate: zodValidate(userContactInfoSchema.shape.lastName, stdZodValidateConfig),
});

const phoneFieldAtom = fieldAtom({
	name: 'phone',
	value: '',
	validate: zodValidate(userContactInfoSchema.shape.phone, stdZodValidateConfig),
});

const userTypeFieldAtom = fieldAtom<z.infer<typeof userContactInfoSchema.shape.type>>({
	name: 'type',
	value: 'creator',
	validate: zodValidate(userContactInfoSchema.shape.type, stdZodValidateConfig),
});

export {
	emailFieldAtom,
	userTypeFieldAtom,
	firstNameFieldAtom,
	lastNameFieldAtom,
	phoneFieldAtom,
};
