import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure, privateProcedure } from '../trpc';
// import { auth, email } from '@barely/utils/node';
import { userCreateSchema } from '@barely/schema/db';

export const userRouter = router({
	current: publicProcedure.query(({ ctx }) => {
		return ctx.user;
	}),
	bySpotifyId: publicProcedure
		.input(z.object({ spotifyId: z.string() }))
		.query(async ({ ctx, input }) => {
			const user = await ctx.prisma.user.findUnique({
				where: {
					spotifyId: input.spotifyId,
				},
			});
			return user;
		}),
	create: publicProcedure.input(userCreateSchema).mutation(async ({ ctx, input }) => {
		const { id, firstName, lastName, email, phone, marketing } = input;
		const newUser = await ctx.prisma.user.create({
			data: { ...input },
		});
		return newUser;
	}),

	// newUser: publicProcedure.input()

	// register: publicProcedure.input(userCreateSchema).mutation(async ({ ctx, input }) => {
	// 	const { firstName, lastName, email, phone, marketingOptIn } = input;
	// 	const exists = await ctx.prisma.user.findFirst({ where: { email } });

	// 	if (exists) throw new TRPCError({ message: 'User already exists', code: 'CONFLICT' });

	// 	const user = await ctx.prisma.user.create({
	// 		data: input,
	// 	});

	// 	return user;
	// }),
	// sendEmailLoginLink: publicProcedure
	// 	.input(z.object({ email: z.string().email(), callbackUrl: z.string().optional() }))
	// 	.mutation(async ({ ctx, input }) => {
	// 		const { email: toEmail, callbackUrl: rawCallbackUrl } = input;
	// 		const callbackUrl = rawCallbackUrl
	// 			? encodeURIComponent(rawCallbackUrl)
	// 			: '/campaigns';

	// 		const user = await ctx.prisma.user.findUnique({
	// 			where: {
	// 				email: toEmail,
	// 			},
	// 		});

	// 		if (!user || !user?.email) {
	// 			throw new TRPCError({
	// 				message: "We can't find a user with that email address.",
	// 				code: 'NOT_FOUND',
	// 			});
	// 		}

	// 		const loginToken = await auth.createLoginToken({ user });

	// 		// send email
	// 		try {
	// 			const sendEmailResponse = await email.send({
	// 				to: user.email,
	// 				from: 'adam@barely.io',
	// 				subject: 'Login to Barely',
	// 				type: 'transactional',
	// 				text: `here is a link: http://localhost:3001/login?token=${loginToken.token}&callbackUrl=${callbackUrl}`,
	// 				html: `here is a link: http://localhost:3001/login?token=${loginToken.token}&callbackUrl=${callbackUrl}`,
	// 			});
	// 			return sendEmailResponse;
	// 		} catch (error) {}
	// 	}),

	// getUser: publicProcedure.query(({ ctx }) => {
	// 	return ctx.user;
	// }),
});
