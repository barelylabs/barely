import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { AnalyticsEndpoints } from '@barely/db/sql';
import { insertAnalyticsEndpointSchema } from '@barely/validators';
import { tasks } from '@trigger.dev/sdk';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import type { sendUsageWarning } from '../../trigger';
import {
	checkUsageLimit,
	getBlockedMessage,
	incrementUsage,
} from '../../functions/usage.fns';
import { workspaceProcedure } from '../trpc';

export const analyticsEndpointRoute = {
	byCurrentWorkspace: workspaceProcedure.query(async ({ ctx }) => {
		const endpointsArray = await dbHttp.query.AnalyticsEndpoints.findMany({
			where: eq(AnalyticsEndpoints.workspaceId, ctx.workspace.id),
		});

		const endpointSet = {
			meta: endpointsArray.find(endpoint => endpoint.platform === 'meta') ?? null,
			google: endpointsArray.find(endpoint => endpoint.platform === 'google') ?? null,
			snapchat: endpointsArray.find(endpoint => endpoint.platform === 'snapchat') ?? null,
			tiktok: endpointsArray.find(endpoint => endpoint.platform === 'tiktok') ?? null,
		};

		return endpointSet;
	}),

	update: workspaceProcedure
		.input(insertAnalyticsEndpointSchema)
		.mutation(async ({ input, ctx }) => {
			if (ctx.workspace.id !== input.workspaceId)
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `WorkspaceId mismatch`,
				});

			const existingPlatformEndpoint = await dbHttp.query.AnalyticsEndpoints.findFirst({
				where: and(
					eq(AnalyticsEndpoints.workspaceId, input.workspaceId),
					eq(AnalyticsEndpoints.platform, input.platform),
				),
			});

			if (existingPlatformEndpoint) {
				// Updating existing pixel - no limit check needed
				const updatedEndpoint = await dbHttp
					.update(AnalyticsEndpoints)
					.set(input)
					.where(
						and(
							eq(AnalyticsEndpoints.workspaceId, input.workspaceId),
							eq(AnalyticsEndpoints.platform, input.platform),
						),
					);
				return updatedEndpoint;
			} else {
				// Creating new pixel - check usage limits
				const usageResult = await checkUsageLimit(ctx.workspace.id, 'pixels');

				// Hard block at 200%
				if (usageResult.status === 'blocked_200') {
					throw new TRPCError({
						code: 'FORBIDDEN',
						message: getBlockedMessage('pixels', usageResult.limit, ctx.workspace.plan),
					});
				}

				// Trigger warning email if needed (async, don't await)
				if (usageResult.shouldSendEmail) {
					const threshold =
						usageResult.status === 'warning_100' ? 100
						: usageResult.status === 'warning_80' ? 80
						: null;
					if (threshold) {
						void tasks.trigger<typeof sendUsageWarning>('send-usage-warning-email', {
							workspaceId: ctx.workspace.id,
							limitType: 'pixels',
							threshold,
						});
					}
				}

				const updatedEndpoint = await dbHttp
					.insert(AnalyticsEndpoints)
					.values(input)
					.returning();

				// Increment pixel usage counter
				await incrementUsage(ctx.workspace.id, 'pixels', 1);

				return updatedEndpoint;
			}
		}),
} satisfies TRPCRouterRecord;
