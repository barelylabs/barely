import { newId } from '../utils/id';
import { createTRPCRouter, publicProcedure } from './api/trpc';
import { createFormResponseSchema } from './form-response.schema';
import { FormResponses } from './form-response.sql';

export const formResponseRouter = createTRPCRouter({
	create: publicProcedure
		.input(createFormResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const formResponse = {
				...input,
				id: newId('formResponse'),
			};

			await ctx.db.http.insert(FormResponses).values(formResponse);

			return formResponse;
		}),
});
