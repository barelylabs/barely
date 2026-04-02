import type { TRPCRouterRecord } from '@trpc/server';
import { APP_EVENT_TYPES } from '@barely/const';
import { ingestAppEvent } from '@barely/tb/ingest';
import { z } from 'zod/v4';

import { privateProcedure } from '../trpc';

export const appAnalyticsRoute = {
	trackAppEvent: privateProcedure
		.input(
			z.object({
				type: z.enum(APP_EVENT_TYPES),
				workspaceId: z.string().optional(),
				pagePath: z.string(),
				properties: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ingestAppEvent({
				userId: ctx.user.id,
				workspaceId: input.workspaceId ?? '',
				type: input.type,
				timestamp: new Date().toISOString(),
				pagePath: input.pagePath,
				properties: input.properties ? JSON.stringify(input.properties) : '{}',
			});
		}),
} satisfies TRPCRouterRecord;
