import { and, asc, desc, eq, gt, inArray, lt, or } from 'drizzle-orm';
import { z } from 'zod';

import type { InsertLandingPage } from './landing-page.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createLandingPageSchema,
	selectWorkspaceLandingPagesSchema,
	updateLandingPageSchema,
} from './landing-page.schema';
import { LandingPages } from './landing-page.sql';

export const landingPageRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceLandingPagesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const landingPages = await ctx.db.http.query.LandingPages.findMany({
				where: sqlAnd([
					eq(LandingPages.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(LandingPages.name, search),
					!!cursor &&
						or(
							lt(LandingPages.createdAt, cursor.createdAt),
							and(
								eq(LandingPages.createdAt, cursor.createdAt),
								gt(LandingPages.id, cursor.id),
							),
						),
				]),
				orderBy: [desc(LandingPages.createdAt), asc(LandingPages.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (landingPages.length > limit) {
				const nextLandingPage = landingPages.pop();
				nextCursor =
					nextLandingPage ?
						{
							id: nextLandingPage?.id,
							createdAt: nextLandingPage?.createdAt,
						}
					:	undefined;
			}

			return {
				landingPages: landingPages.slice(0, limit),
				nextCursor,
			};
		}),

	create: privateProcedure
		.input(createLandingPageSchema)
		.mutation(async ({ input, ctx }) => {
			const landingPageData: InsertLandingPage = {
				...input,
				id: newId('landingPage'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
			};

			const landingPage = await ctx.db.http
				.insert(LandingPages)
				.values(landingPageData)
				.returning();

			return landingPage[0] ?? raise('Failed to create landing page');
		}),

	update: privateProcedure
		.input(updateLandingPageSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedLandingPage = await ctx.db.http
				.update(LandingPages)
				.set(input)
				.where(
					and(
						eq(LandingPages.id, input.id),
						eq(LandingPages.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			return updatedLandingPage[0] ?? raise('Failed to update landing page');
		}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedLandingPage = await ctx.db.http
				.update(LandingPages)
				.set({ archived: true })
				.where(
					and(
						eq(LandingPages.workspaceId, ctx.workspace.id),
						inArray(LandingPages.id, input),
					),
				)
				.returning();

			return updatedLandingPage[0] ?? raise('Failed to archive landing page');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedLandingPage = await ctx.db.http
			.update(LandingPages)
			.set({ deletedAt: new Date().toISOString() })
			.where(
				and(
					eq(LandingPages.workspaceId, ctx.workspace.id),
					inArray(LandingPages.id, input),
				),
			)
			.returning();

		return updatedLandingPage[0] ?? raise('Failed to delete landing page');
	}),
});
