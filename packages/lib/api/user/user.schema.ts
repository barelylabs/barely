import { z } from 'zod';

import { undefinedToNull } from '../../utils/edge/handle-undefined';
import {
	formatInternational,
	isPossiblePhoneNumber,
} from '../../utils/edge/phone-number';

const userTypeSchema = z.enum([
	'label',
	'artist',
	'manager',
	'creator',
	'influencer',
	'marketer',
]);

const userSchema = z.object({
	id: z.string(),
	type: userTypeSchema,
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	username: z.string().optional(),
	email: z.string().email(),
	emailVerified: z.string().optional(),
	phone: z.string().optional(),
	phoneVerified: z.string().optional(),
	image: z.string().optional(),
	marketing: z.boolean().optional(),
	stripeId: z.string().optional(),
	pitchScreening: z.boolean().optional(),
	pitchReviewing: z.boolean().optional(),
});

const userContactInfoSchema = z.object({
	firstName: userSchema.shape.firstName
		.unwrap()
		.min(2, { message: 'First name must be at least 2 characters' }),
	lastName: userSchema.shape.lastName
		.unwrap()
		.min(2, { message: 'Last name must be at least 2 characters' }),
	email: userSchema.shape.email,
	phone: userSchema.shape.phone
		.unwrap()
		.refine(
			phone => {
				const isPossible = isPossiblePhoneNumber(phone);
				const empty = phone.length === 0;
				return isPossible || empty;
			},
			{
				message: 'Phone number is invalid. Please enter a correct one.',
			},
		)
		.transform(phone => (!phone.length ? null : formatInternational(phone)))
		.nullable(),
	type: userSchema.shape.type,
});

const sessionUserSchema = z.object({
	id: userSchema.shape.id,
	email: userSchema.shape.email,
	phone: userSchema.shape.phone.nullish().transform(v => undefinedToNull(v)),
	firstName: userSchema.shape.firstName.nullish().transform(v => undefinedToNull(v)),
	lastName: userSchema.shape.lastName.nullish().transform(v => undefinedToNull(v)),
	fullName: userSchema.shape.firstName.nullish().transform(v => undefinedToNull(v)),
	image: userSchema.shape.image.nullish().transform(v => undefinedToNull(v)),
	type: userSchema.shape.type,
	pitchScreening: userSchema.shape.pitchScreening.transform(v => undefinedToNull(v)),
	pitchReviewing: userSchema.shape.pitchReviewing.transform(v => undefinedToNull(v)),
	stripeId: userSchema.shape.stripeId.nullish().transform(v => undefinedToNull(v)),
});

export { userTypeSchema, userSchema, sessionUserSchema, userContactInfoSchema };
