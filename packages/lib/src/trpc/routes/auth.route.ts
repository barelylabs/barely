import type { TRPCRouterRecord } from '@trpc/server';
import { z } from 'zod/v4';

import { sendMagicLink } from '@barely/auth/utils';

import { publicProcedure } from '../trpc';

export const authRoute = {
	sendLoginEmail: publicProcedure
		.input(
			z.object({
				email: z.email(),
				callbackUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const emailRes = await sendMagicLink(input);

			if ('error' in emailRes && emailRes.error)
				return { success: false, message: 'Something went wrong' };

			return { success: true };
		}),
} satisfies TRPCRouterRecord;

export type AuthRoute = typeof authRoute;
