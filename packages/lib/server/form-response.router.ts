import { newId } from '../utils/id';
import { publicProcedure, router } from './api';
import { createFormResponseSchema } from './form-response.schema';
import { FormResponses } from './form-response.sql';

export const formResponseRouter = router({
	create: publicProcedure
		.input(createFormResponseSchema)
		.mutation(async ({ input, ctx }) => {
			const formResponse = {
				...input,
				id: newId('formResponse'),
			};

			await ctx.db.write.insert(FormResponses).values(formResponse);

			return formResponse;
		}),
});
