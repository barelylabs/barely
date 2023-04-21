import { z } from 'zod';

import { prisma } from '@barely/db';

import { parseForDb } from '../../utils/edge/phone-number';
import { createStripeUser } from '../stripe/stripe.node.fns';
import { userContactInfoSchema } from './user.schema';

const createUser = async (user: z.infer<typeof userContactInfoSchema>) => {
	const fullName = user.firstName + ' ' + user.lastName;
	const phone = user.phone ? parseForDb(user.phone) : undefined;

	const newUser = await prisma.user.create({
		data: { ...user, fullName, phone },
	});

	const newUserWithStripe = await createStripeUser({
		name: fullName,
		userId: newUser.id,
		email: user.email,
		phone,
	});

	return newUserWithStripe;
};

export { createUser };
