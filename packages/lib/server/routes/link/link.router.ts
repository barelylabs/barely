import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { InsertLink } from './link.schema';
import { env } from '../../../env';
import { newId } from '../../../utils/id';
import { sanitizeKey } from '../../../utils/key';
import {
	getMetaTags,
	getTransparentLinkDataFromUrl,
	isValidUrl,
} from '../../../utils/link';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../../api/trpc';
import { getRandomKey } from './link.fns';
import {
	createLinkSchema,
	selectWorkspaceLinksSchema,
	updateLinkSchema,
} from './link.schema';
import { Links } from './link.sql';

export const linkRouter = createTRPCRouter({
	byId: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
		{
			const link = await ctx.db.http.query.Links.findFirst({
				where: eq(Links.id, input),
			});

			return link ?? null;
		}
	}),

	byWorkspace: privateProcedure
		.input(selectWorkspaceLinksSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived } = input;

			const links = await ctx.db.http.query.Links.findMany({
				where: sqlAnd([
					eq(Links.workspaceId, ctx.workspace.id),
					!!search?.length &&
						or(
							sqlStringContains(Links.key, search),
							sqlStringContains(Links.url, search),
						),
					showArchived ? undefined : isNull(Links.archivedAt),
					!!cursor &&
						or(
							lt(Links.createdAt, cursor.createdAt),
							and(eq(Links.createdAt, cursor.createdAt), eq(Links.id, cursor.id)),
						),
				]),

				orderBy: [desc(Links.createdAt), desc(Links.id)],
				limit: limit + 1,
			});

			let nextCursor: typeof cursor | undefined = undefined;

			if (links.length > limit) {
				const nextLink = links.pop();
				nextCursor =
					nextLink ?
						{
							id: nextLink.id,
							createdAt: nextLink.createdAt,
						}
					:	undefined;
			}

			return {
				links,
				nextCursor,
			};
		}),

	// mutate
	create: privateProcedure.input(createLinkSchema).mutation(async ({ input, ctx }) => {
		const transparentLinkData = getTransparentLinkDataFromUrl(input.url, ctx.workspace);

		if (input.transparent && !transparentLinkData) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: `Invalid URL for transparent link`,
			});
		}

		const metaTags =
			input.customMetaTags ?
				{
					title: input.title,
					description: input.description,
					image: input.image,
				}
			:	await getMetaTags(input.url);

		const linkId = newId('link');

		if (metaTags.description && metaTags.description.length > 500) {
			metaTags.description = metaTags.description.substring(0, 500);
		}

		const insertLinkValues = {
			...input,
			id: linkId,
			userId: ctx.user.id,
			workspaceId: ctx.workspace.id,
			handle: ctx.workspace.handle,
			key: sanitizeKey(input.key),
			...metaTags,
			...(input.transparent ? transparentLinkData : {}),
		} satisfies InsertLink;

		const link = await ctx.db.http.insert(Links).values(insertLinkValues).returning();
		return link;
	}),

	update: privateProcedure.input(updateLinkSchema).mutation(async ({ input, ctx }) => {
		// if (!!input.workspaceId && input.workspaceId !== ctx.workspace.id) {
		// 	throw new TRPCError({
		// 		code: 'BAD_REQUEST',
		// 		message: `Invalid workspace`,
		// 	});
		// }

		const existingLink =
			(await ctx.db.pool.query.Links.findFirst({
				where: and(eq(Links.workspaceId, ctx.workspace.id), eq(Links.id, input.id)),
			})) ?? raise('Link not found');

		if (existingLink.transparent === true && input.transparent === false) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: `You can't make a transparent link non-transparent`,
			});
		}

		if (input.transparent === true) {
			const appData = getTransparentLinkDataFromUrl(existingLink.url, ctx.workspace);

			if (!appData) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: `Invalid URL`,
				});
			}

			input = { ...input, app: appData.app, appRoute: appData.appRoute };
		}

		const metaTags =
			input.customMetaTags ?
				{
					title: input.title,
					description: input.description,
					image: input.image,
				}
			:	await getMetaTags(existingLink.url);

		console.log('metaTags', metaTags);

		const link = await ctx.db.pool
			.update(Links)
			.set({
				...input,
				...metaTags,
				key: input.key ? sanitizeKey(input.key) : undefined,
			})
			.where(eq(Links.id, input.id))
			.returning();
		return link;
	}),

	archive: privateProcedure
		.input(z.array(z.string()))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.http
				.update(Links)
				.set({ archivedAt: new Date() })
				.where(and(eq(Links.workspaceId, ctx.workspace.id), inArray(Links.id, input)));
		}),

	delete: privateProcedure.input(z.array(z.string())).mutation(async ({ ctx, input }) => {
		await ctx.db.http
			.update(Links)
			.set({
				deletedAt: new Date(),
			})
			.where(and(eq(Links.workspaceId, ctx.workspace.id), inArray(Links.id, input)));
	}),

	// utils
	getMetaTags: publicProcedure.input(z.string()).query(async ({ input: url, ctx }) => {
		if (!url.length || !isValidUrl(url)) {
			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: `Invalid URL`,
			});
		}

		// Rate limit if user is not logged in
		if (!ctx.user) {
			const ip = ctx.visitor?.ip ?? env.LOCALHOST_IP;
			const { success } = await ctx.ratelimit().limit(ip);
			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: `Pls don't DDOS me 🙏`,
				});
			}
		}

		return await getMetaTags(url);
	}),

	generateRandomKey: publicProcedure
		.input(z.object({ domain: z.string() }))
		.mutation(async ({ input }) => {
			return await getRandomKey(input.domain);
		}),
});
