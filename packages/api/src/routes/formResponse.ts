import { router, publicProcedure, privateProcedure } from '../trpc';
import { formResponseCreateSchema } from '../../../schema/db/formresponse';

export const formResponseRouter = router({
	create: publicProcedure
		.input(formResponseCreateSchema)
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.formResponse.create({
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
