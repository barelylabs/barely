import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { AnalyticsEndpoints } from '@barely/db/sql';
import { insertAnalyticsEndpointSchema } from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

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
				const updatedEndpoint = await dbHttp
					.insert(AnalyticsEndpoints)
					.values(input)
					.returning();
				return updatedEndpoint;
			}
		}),
} satisfies TRPCRouterRecord;
