// import { User, Session } from 'next-auth';
// import { AdapterUser } from 'next-auth/adapters';
import { JWT } from 'next-auth/jwt';

import { sessionUserSchema } from '../api/user/user.schema';

// const sessionUserSchema = userSchema.pick({
// 	id: true,
// 	email: true,
// 	phone: true,
// 	image: true,
// 	type: true,
// 	pitchScreening: true,
// 	stripeId: true,
// });

const getUserFromToken = (token: JWT) => {
	const parsedUser = sessionUserSchema.safeParse(token);

	if (!parsedUser.success) {
		console.log('ack bad user!', parsedUser.error);
		return null;
	}

	console.log('parsedUser', parsedUser.data);
	return parsedUser.data;
};

export { getUserFromToken };
