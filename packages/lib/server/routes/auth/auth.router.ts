import { z } from 'zod/v4';

import { createTRPCRouter, publicProcedure } from '../../api/trpc';
import { sendLoginEmail } from '../../auth/auth.fns';

export const authRouter = createTRPCRouter({
	sendLoginEmail: publicProcedure
		.input(
			z.object({
				email: z.string().email(),
				callbackUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const emailRes = await sendLoginEmail(input);

			if ('error' in emailRes && emailRes.error)
				return { success: false, message: 'Something went wrong' };

			return { success: true };
		}),
});
