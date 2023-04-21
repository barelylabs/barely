import { prisma } from '@barely/db';

import { publicProcedure, router } from '../trpc';
import { formResponseSchema } from './formresponse.schema';

export const formResponseRouter = router({
	create: publicProcedure.input(formResponseSchema).mutation(async ({ input }) => {
		return await prisma.formResponse.create({
			data: {
				form: {
					connect: { id: input.formId },
				},
				name: input.name,
				email: input.email,
				phone: input.phone,
				message: input.message,
			},
		});
	}),
});
