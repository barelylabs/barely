import type { InsertLink } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Links } from '@barely/db/sql/link.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import {
	getMetaTags,
	getTransparentLinkDataFromUrl,
	isValidUrl,
	newId,
	raiseTRPCError,
	sanitizeKey,
} from '@barely/utils';
import {
	createLinkSchema,
	selectWorkspaceLinksSchema,
	updateLinkSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';
import { getRandomKey } from '../../functions/link.fns';
import { ratelimit } from '../../integrations/upstash';
import { publicProcedure, workspaceProcedure } from '../trpc';

export const linkRoute = {
	byId: publicProcedure.input(z.string()).query(async ({ input }) => {
		{
			const link = await dbHttp.query.Links.findFirst({
				where: eq(Links.id, input),
			});

			return link ?? null;
		}
	}),

	byWorkspace: workspaceProcedure
		.input(selectWorkspaceLinksSchema)
		.query(async ({ input, ctx }) => {
			console.log('current app', libEnv.NEXT_PUBLIC_CURRENT_APP);

			const { limit, cursor, search, showArchived } = input;

			const links = await dbHttp.query.Links.findMany({
				where: sqlAnd([
					eq(Links.workspaceId, ctx.workspace.id),
					!!search.length &&
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
	create: workspaceProcedure.input(createLinkSchema).mutation(async ({ input, ctx }) => {
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

		const link = await dbHttp.insert(Links).values(insertLinkValues).returning();
		return link;
	}),

	update: workspaceProcedure.input(updateLinkSchema).mutation(async ({ input, ctx }) => {
		// if (!!input.workspaceId && input.workspaceId !== ctx.workspace.id) {
		// 	throw new TRPCError({
		// 		code: 'BAD_REQUEST',
		// 		message: `Invalid workspace`,
		// 	});
		// }

		const existingLink =
			(await dbPool(ctx.pool).query.Links.findFirst({
				where: and(eq(Links.workspaceId, ctx.workspace.id), eq(Links.id, input.id)),
			})) ?? raiseTRPCError({ message: 'Link not found' });

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

		const link = await dbPool(ctx.pool)
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

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Links)
				.set({ archivedAt: new Date() })
				.where(
					and(eq(Links.workspaceId, ctx.workspace.id), inArray(Links.id, input.ids)),
				);
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Links)
				.set({
					deletedAt: new Date(),
				})
				.where(
					and(eq(Links.workspaceId, ctx.workspace.id), inArray(Links.id, input.ids)),
				);
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
			const ip = ctx.visitor?.ip ?? libEnv.LOCALHOST_IP;
			const { success } = await ratelimit().limit(ip);
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
} satisfies TRPCRouterRecord;
