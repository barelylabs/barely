import { and, asc, desc, eq, gt, inArray, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod';

import type { InsertFmLink, InsertFmPage } from './fm.schema';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import {
	createTRPCRouter,
	privateProcedure,
	workspaceQueryProcedure,
} from '../../api/trpc';
import {
	createFmPageSchema,
	selectWorkspaceFmPagesSchema,
	updateFmPageSchema,
} from './fm.schema';
import { FmLinks, FmPages } from './fm.sql';

export const fmRouter = createTRPCRouter({
	byWorkspace: workspaceQueryProcedure
		.input(selectWorkspaceFmPagesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search } = input;
			const fmPages = await ctx.db.http.query.FmPages.findMany({
				with: {
					links: {
						orderBy: [asc(FmLinks.index)],
					},
					coverArt: true,
				},
				where: sqlAnd([
					eq(FmPages.workspaceId, ctx.workspace.id),
					!!search?.length && sqlStringContains(FmPages.title, search),
					!!cursor &&
						or(
							lt(FmPages.createdAt, cursor.createdAt),
							and(eq(FmPages.createdAt, cursor.createdAt), gt(FmPages.id, cursor.id)),
						),
				]),

				orderBy: [desc(FmPages.createdAt), asc(FmPages.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (fmPages.length > limit) {
				const nextFmPage = fmPages.pop();
				nextCursor =
					nextFmPage ?
						{
							id: nextFmPage?.id,
							createdAt: nextFmPage?.createdAt,
						}
					:	undefined;
			}

			return {
				fmPages: fmPages.slice(0, limit),
				nextCursor,
			};
		}),

	create: privateProcedure.input(createFmPageSchema).mutation(async ({ input, ctx }) => {
		const fmPageData: InsertFmPage = {
			...input,
			id: newId('fmPage'),
			workspaceId: ctx.workspace.id,
			handle: ctx.workspace.handle,
		};

		const fmPages = await ctx.db.pool.insert(FmPages).values(fmPageData).returning();
		const fmPage = fmPages[0] ?? raise('Failed to create fm page');

		const fmLinks = input.links.map((link, index) => ({
			...link,
			id: newId('fmLink'),
			fmPageId: fmPage.id,
			index,
		})) satisfies InsertFmLink[];

		await ctx.db.pool.insert(FmLinks).values(fmLinks);

		return fmPage;
	}),

	update: privateProcedure.input(updateFmPageSchema).mutation(async ({ input, ctx }) => {
		const { id, links, ...data } = input;

		await ctx.db.pool.update(FmPages).set(data).where(eq(FmPages.id, id)).returning();

		if (links !== undefined) {
			const linkIds = links
				.map(link => link.id)
				.filter(id => id !== undefined) as string[];

			await Promise.all(
				links.map(async (link, index) => {
					if (link.id) {
						await ctx.db.pool
							.update(FmLinks)
							.set({ ...link, index })
							.where(eq(FmLinks.id, link.id));
					} else {
						const newLinkId = newId('fmLink');
						await ctx.db.pool.insert(FmLinks).values({
							...link,
							id: newLinkId,
							fmPageId: id,
							index,
						});
						linkIds.push(newLinkId);
					}
				}),
			);

			// remove any links that are not in the new links
			await ctx.db.pool
				.delete(FmLinks)
				.where(and(eq(FmLinks.fmPageId, id), notInArray(FmLinks.id, linkIds)));
		}
	}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ input, ctx }) => {
			const updatedFmPage = await ctx.db.http
				.update(FmPages)
				.set({ archived: true })
				.where(and(eq(FmPages.workspaceId, ctx.workspace.id), inArray(FmPages.id, input)))
				.returning();

			return updatedFmPage[0] ?? raise('Failed to archive fm page');
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
		const updatedFmPage = await ctx.db.http
			.update(FmPages)
			.set({ deletedAt: new Date().toISOString() })
			.where(and(eq(FmPages.workspaceId, ctx.workspace.id), inArray(FmPages.id, input)))
			.returning();

		return updatedFmPage[0] ?? raise('Failed to delete fm page');
	}),
});
