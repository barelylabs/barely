import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { createEmail, updateEmail } from './email.fns';
import { createEmailSchema, updateEmailSchema } from './email.schema';

export const emailRouter = createTRPCRouter({
	createEmail: privateProcedure
		.input(createEmailSchema)
		.mutation(async ({ ctx, input }) => {
			return createEmail({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),

	updateEmail: privateProcedure
		.input(updateEmailSchema)
		.mutation(async ({ ctx, input }) => {
			return updateEmail({
				...input,
				workspaceId: ctx.workspace.id,
			});
		}),
});
