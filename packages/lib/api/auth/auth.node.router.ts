import { z } from 'zod';

import { prisma } from '@barely/db';
import { sendEmail } from '@barely/email';
import { SignInEmailTemplate } from '@barely/email/templates/sign-in';

import { publicProcedure, router } from '../trpc';
import { createLoginLink } from './auth.node.fns';

export const authRouter = router({
	sendLoginEmail: publicProcedure
		.input(z.object({ email: z.string().email(), callbackUrl: z.string().optional() }))
		.mutation(async ({ input }) => {
			const { email, callbackUrl } = input;

			console.log('sendLoginEmail', email, callbackUrl);

			const user = await prisma.user.findUnique({
				where: {
					email,
				},
			});

			if (!user)
				return { success: false, message: 'Email not found', code: 'EMAIL_NOT_FOUND' };

			const loginLink = await createLoginLink({
				provider: 'email',
				identifier: email,
				callbackUrl,
			});

			const SignInEmail = SignInEmailTemplate({
				firstName: user.firstName ?? user.username ?? undefined,
				loginLink,
			});

			const emailRes = await sendEmail({
				to: input.email,
				from: 'barely.io <support@barely.io>',
				subject: 'Barely Login Link',
				template: SignInEmail,
				type: 'transactional',
			});

			if (!emailRes) return { success: false, message: 'Something went wrong' };

			if (emailRes.ErrorCode) return { success: false, message: emailRes.Message };

			return { success: true };
		}),
});
