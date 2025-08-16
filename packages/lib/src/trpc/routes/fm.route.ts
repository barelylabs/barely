import type { FileRecord, InsertFmLink, InsertFmPage } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import { Files } from '@barely/db/sql/file.sql';
import { FmLinks, FmPages } from '@barely/db/sql/fm.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import { uploadFileFromUrl } from '@barely/files/upload-from-url';
import { getFileKey } from '@barely/files/utils';
import { newId, raiseTRPCError, sanitizeKey } from '@barely/utils';
import {
	createFmPageSchema,
	selectWorkspaceFmPagesSchema,
	updateFmPageSchema,
} from '@barely/validators';
import { tasks, waitUntil } from '@trigger.dev/sdk/v3';
import { and, asc, desc, eq, gt, inArray, isNull, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import type { generateFileBlurHash } from '../../trigger';
import { libEnv } from '../../../env';
import { workspaceProcedure } from '../trpc';

export const fmRoute = {
	byWorkspace: workspaceProcedure
		.input(selectWorkspaceFmPagesSchema)
		.query(async ({ input, ctx }) => {
			const { limit, cursor, search, showArchived, showDeleted } = input;

			const fmPages = await dbHttp.query.FmPages.findMany({
				with: {
					links: {
						orderBy: [asc(FmLinks.index)],
					},
					coverArt: true,
				},
				where: sqlAnd([
					eq(FmPages.workspaceId, ctx.workspace.id),
					showArchived ? undefined : isNull(FmPages.archivedAt),
					showDeleted ? undefined : isNull(FmPages.deletedAt),
					!!search.length && sqlStringContains(FmPages.title, search),
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
							id: nextFmPage.id,
							createdAt: nextFmPage.createdAt,
						}
					:	undefined;
			}

			// check if cover art has blur hash
			for (const fmPage of fmPages) {
				if (fmPage.coverArt && !fmPage.coverArt.blurDataUrl) {
					waitUntil(
						tasks.trigger<typeof generateFileBlurHash>('generate-file-blur-hash', {
							fileId: fmPage.coverArt.id,
							s3Key: fmPage.coverArt.s3Key,
						}),
					);
				}
			}

			return {
				fmPages,
				nextCursor,
			};
		}),

	byId: workspaceProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const fmPage = await dbHttp.query.FmPages.findFirst({
				where: and(eq(FmPages.id, input.id), eq(FmPages.workspaceId, ctx.workspace.id)),
				with: {
					links: {
						orderBy: [asc(FmLinks.index)],
					},
					coverArt: true,
				},
			});

			return fmPage;
		}),

	create: workspaceProcedure
		.input(createFmPageSchema)
		.mutation(async ({ input, ctx }) => {
			const { coverArtUrl, ...data } = input;

			if (!data.coverArtId && coverArtUrl) {
				console.log('creating coverArt file ');

				const fileId = newId('file');
				const key = getFileKey({
					workspaceId: ctx.workspace.id,
					folder: 'fm-cover-art',
					fileName: newId('fmCoverArt'),
				});

				const upload = await uploadFileFromUrl({
					url: coverArtUrl,
					key,
				});

				const fileRecord: FileRecord = {
					id: fileId,
					workspaceId: ctx.workspace.id,
					bucket: libEnv.AWS_S3_BUCKET_NAME,
					folder: 'fm-cover-art',
					s3Key: key,
					name: key,
					type: 'image',
					src: upload.src,
					size: upload.fileSize,
					internal: true,
					createdById: ctx.user.id,
					uploadedById: ctx.user.id,
				};

				await dbPool(ctx.pool).insert(Files).values(fileRecord).returning();
				data.coverArtId = fileId;

				console.log('fileId >> ', fileId);
				console.log('data.coverArtId', data.coverArtId);
			}

			// console.log('data >> ', data);

			const fmPageData: InsertFmPage = {
				...data,
				id: newId('fmPage'),
				workspaceId: ctx.workspace.id,
				handle: ctx.workspace.handle,
				key: sanitizeKey(data.key),
			};

			const fmPages = await dbPool(ctx.pool)
				.insert(FmPages)
				.values(fmPageData)
				.returning();
			const fmPage = fmPages[0] ?? raiseTRPCError({ message: 'Failed to create fm page' });

			const fmLinks = input.links.map((link, index) => ({
				...link,
				id: newId('fmLink'),
				fmPageId: fmPage.id,
				index,
			})) satisfies InsertFmLink[];

			await dbPool(ctx.pool).insert(FmLinks).values(fmLinks);

			return fmPage;
		}),

	update: workspaceProcedure
		.input(updateFmPageSchema)
		.mutation(async ({ input, ctx }) => {
			const { id, links, ...data } = input;

			await dbPool(ctx.pool)
				.update(FmPages)
				.set({
					...data,
					key: data.key ? sanitizeKey(data.key) : undefined,
				})
				.where(and(eq(FmPages.id, id), eq(FmPages.workspaceId, ctx.workspace.id)))
				.returning();

			if (links !== undefined) {
				const linkIds = links.map(link => link.id).filter(id => id !== undefined);

				await Promise.all(
					links.map(async (link, index) => {
						if (link.id) {
							await dbPool(ctx.pool)
								.update(FmLinks)
								.set({ ...link, index })
								.where(eq(FmLinks.id, link.id));
						} else {
							const newLinkId = newId('fmLink');
							await dbPool(ctx.pool)
								.insert(FmLinks)
								.values({
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
				await dbPool(ctx.pool)
					.delete(FmLinks)
					.where(and(eq(FmLinks.fmPageId, id), notInArray(FmLinks.id, linkIds)));
			}
		}),

	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFmPage = await dbHttp
				.update(FmPages)
				.set({ archivedAt: new Date() })
				.where(
					and(eq(FmPages.workspaceId, ctx.workspace.id), inArray(FmPages.id, input.ids)),
				)
				.returning();

			return updatedFmPage[0] ?? raiseTRPCError({ message: 'Failed to archive fm page' });
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const updatedFmPage = await dbHttp
				.update(FmPages)
				.set({ deletedAt: new Date() })
				.where(
					and(eq(FmPages.workspaceId, ctx.workspace.id), inArray(FmPages.id, input.ids)),
				)
				.returning();

			return updatedFmPage[0] ?? raiseTRPCError({ message: 'Failed to delete fm page' });
		}),
} satisfies TRPCRouterRecord;
