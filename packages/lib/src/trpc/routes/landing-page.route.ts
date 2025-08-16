import type { InsertLandingPage } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import {
	_LandingPage_To_CartFunnels,
	_LandingPage_To_LandingPage,
	_LandingPage_To_Link,
	_LandingPage_To_PressKit,
	LandingPages,
} from '@barely/db/sql/landing-page.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { newId, raiseTRPCError, sanitizeKey } from '@barely/utils';
import {
	createLandingPageSchema,
	selectWorkspaceLandingPagesSchema,
	updateLandingPageSchema,
} from '@barely/validators';
import { and, asc, desc, eq, gt, inArray, isNull, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getLandingPageAssetJoins } from '../../functions/landing-page.fns';
import { workspaceProcedure } from '../trpc';

export const landingPageRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceLandingPagesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;
			const landingPages = await dbHttp.query.LandingPages.findMany({
				where: sqlAnd([
					eq(LandingPages.workspaceId, ctx.workspace.id),
					!!search.length && sqlStringContains(LandingPages.name, search),
					showArchived ? undefined : isNull(LandingPages.archivedAt),
					showDeleted ? undefined : isNull(LandingPages.deletedAt),
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
							id: nextLandingPage.id,
							createdAt: nextLandingPage.createdAt,
						}
					:	undefined;
			}

			return {
				landingPages: landingPages.slice(0, limit),
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(
			z.object({
				landingPageId: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { landingPageId } = input;
			const landingPage = await dbHttp.query.LandingPages.findFirst({
				where: and(
					eq(LandingPages.id, landingPageId),
					eq(LandingPages.workspaceId, ctx.workspace.id),
				),
			});

			return landingPage ?? raiseTRPCError({ message: 'Landing page not found' });
		}),

	create: workspaceProcedure
		.input(createLandingPageSchema)
		.mutation(async ({ input, ctx }) => {
			const { name, key, content, ...rest } = input;
			const landingPageData: InsertLandingPage = {
				...rest,
				name,
				content,
				id: newId('landingPage'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
				key: sanitizeKey(key),
			};

			const landingPages = await dbHttp
				.insert(LandingPages)
				.values(landingPageData)
				.returning();

			const landingPage =
				landingPages[0] ?? raiseTRPCError({ message: 'Failed to create landing page' });

			const { cartFunnelJoins, linkJoins, pressKitJoins, landingPageJoins } =
				getLandingPageAssetJoins({
					content: input.content ?? '',
					landingPageId: landingPage.id,
				});

			await Promise.allSettled([
				cartFunnelJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_CartFunnels).values(cartFunnelJoins)
				:	Promise.resolve(),
				pressKitJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_PressKit).values(pressKitJoins)
				:	Promise.resolve(),
				landingPageJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_LandingPage).values(landingPageJoins)
				:	Promise.resolve(),
				linkJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_Link).values(linkJoins)
				:	Promise.resolve(),
			]);

			return landingPage;
		}),

	update: workspaceProcedure
		.input(updateLandingPageSchema)
		.mutation(async ({ input, ctx }) => {
			const updatedLandingPages = await dbHttp
				.update(LandingPages)
				.set({
					...input,
					key: input.key ? sanitizeKey(input.key) : undefined,
				})
				.where(
					and(
						eq(LandingPages.id, input.id),
						eq(LandingPages.workspaceId, ctx.workspace.id),
					),
				)
				.returning();

			const updatedLandingPage =
				updatedLandingPages[0] ??
				raiseTRPCError({ message: 'Failed to update landing page' });

			if (!input.content) return updatedLandingPage;

			const {
				cartFunnelIds,
				cartFunnelJoins,
				landingPageDestinationIds,
				landingPageJoins,
				linkIds,
				linkJoins,
				pressKitIds,
				pressKitJoins,
			} = getLandingPageAssetJoins({
				content: input.content ?? '',
				landingPageId: input.id,
			});

			await Promise.allSettled([
				// cart funnels
				cartFunnelJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_CartFunnels).values(cartFunnelJoins)
				:	Promise.resolve(),
				dbHttp
					.delete(_LandingPage_To_CartFunnels)
					.where(
						sqlAnd([
							eq(_LandingPage_To_CartFunnels.landingPageId, input.id),
							cartFunnelIds.length ?
								notInArray(_LandingPage_To_CartFunnels.cartFunnelId, cartFunnelIds)
							:	undefined,
						]),
					),

				// press kits
				pressKitJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_PressKit).values(pressKitJoins)
				:	Promise.resolve(),
				dbHttp
					.delete(_LandingPage_To_PressKit)
					.where(
						sqlAnd([
							eq(_LandingPage_To_PressKit.landingPageId, input.id),
							pressKitIds.length ?
								notInArray(_LandingPage_To_PressKit.pressKitId, pressKitIds)
							:	undefined,
						]),
					),

				// landing pages
				landingPageJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_LandingPage).values(landingPageJoins)
				:	Promise.resolve(),
				dbHttp
					.delete(_LandingPage_To_LandingPage)
					.where(
						sqlAnd([
							eq(_LandingPage_To_LandingPage.landingPageSourceId, input.id),
							landingPageDestinationIds.length ?
								notInArray(
									_LandingPage_To_LandingPage.landingPageDestinationId,
									landingPageDestinationIds,
								)
							:	undefined,
						]),
					),

				// links
				linkJoins.length > 0 ?
					dbHttp.insert(_LandingPage_To_Link).values(linkJoins)
				:	Promise.resolve(),
				dbHttp
					.delete(_LandingPage_To_Link)
					.where(
						sqlAnd([
							eq(_LandingPage_To_Link.landingPageId, input.id),
							linkIds.length ?
								notInArray(_LandingPage_To_Link.linkId, linkIds)
							:	undefined,
						]),
					),
			]);
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedLandingPage = await dbHttp
				.update(LandingPages)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(LandingPages.workspaceId, ctx.workspace.id),
						inArray(LandingPages.id, input.ids),
					),
				)
				.returning();

			return (
				updatedLandingPage[0] ??
				raiseTRPCError({ message: 'Failed to archive landing page' })
			);
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedLandingPage = await dbHttp
				.update(LandingPages)
				.set({ deletedAt: new Date() })
				.where(
					and(
						eq(LandingPages.workspaceId, ctx.workspace.id),
						inArray(LandingPages.id, input.ids),
					),
				)
				.returning();

			return (
				updatedLandingPage[0] ??
				raiseTRPCError({ message: 'Failed to delete landing page' })
			);
		}),
} satisfies TRPCRouterRecord;
