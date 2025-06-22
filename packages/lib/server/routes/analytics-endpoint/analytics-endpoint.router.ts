import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';

import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { insertAnalyticsEndpointSchema } from './analytics-endpoint-schema';
import { AnalyticsEndpoints } from './analytics-endpoint.sql';

export const analyticsEndpointRouter = createTRPCRouter({
	byCurrentWorkspace: privateProcedure.query(async ({ ctx }) => {
		const endpointsArray = await ctx.db.http.query.AnalyticsEndpoints.findMany({
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

	update: privateProcedure
		.input(insertAnalyticsEndpointSchema)
		.mutation(async ({ input, ctx }) => {
			if (ctx.workspace.id !== input.workspaceId)
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `WorkspaceId mismatch`,
				});

			// upsert the endpoint
			// const updatedEndpoint = await ctx.db.http
			// 	.insert(AnalyticsEndpoints)
			// 	.values(input)
			// 	.onConflictDoUpdate({
			// 		target: [AnalyticsEndpoints.workspaceId, AnalyticsEndpoints.platform],
			// 		set: input,
			// 	});

			const existingPlatformEndpoint =
				await ctx.db.http.query.AnalyticsEndpoints.findFirst({
					where: and(
						eq(AnalyticsEndpoints.workspaceId, input.workspaceId),
						eq(AnalyticsEndpoints.platform, input.platform),
					),
				});

			if (existingPlatformEndpoint) {
				const updatedEndpoint = await ctx.db.http
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
				const updatedEndpoint = await ctx.db.http
					.insert(AnalyticsEndpoints)
					.values(input)
					.returning();
				return updatedEndpoint;
			}
		}),
});
