import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { FormResponses } from '@barely/db/sql/form-response.sql';
import { newId } from '@barely/utils';
import { createFormResponseSchema } from '@barely/validators';

import { publicProcedure } from '../trpc';

export const formResponseRoute = {
	create: publicProcedure.input(createFormResponseSchema).mutation(async ({ input }) => {
		const formResponse = {
			...input,
			id: newId('formResponse'),
		};

		await dbHttp.insert(FormResponses).values(formResponse);

		return formResponse;
	}),
} satisfies TRPCRouterRecord;
