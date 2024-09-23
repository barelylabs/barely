import type { AllowedFileType } from '@uploadthing/shared';
import { lookup } from '@uploadthing/mime-types';
import { ALLOWED_FILE_TYPES, getTypeFromFileName } from '@uploadthing/shared';
import { and, asc, desc, eq, gt, inArray, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod';

import type { Presigned } from '../../../files/types';
import type { FileRecord } from './file.schema';
import { env } from '../../../env';
import { completeMultipartUpload, getPresigned } from '../../../files/s3-presign';
import { getFileKey, getTotalUploadSize } from '../../../files/utils';
import { getUserWorkspaceByHandle } from '../../../utils/auth';
import { newId } from '../../../utils/id';
import { raise } from '../../../utils/raise';
import { sqlAnd, sqlStringContains } from '../../../utils/sql';
import { createTRPCRouter, privateProcedure } from '../../api/trpc';
import { incrementWorkspaceFileUsage } from '../workspace/workspace.fns';
import { selectWorkspaceFilesSchema, uploadFileSchema } from './file.schema';
import { Files } from './file.sql';

export const fileRouter = createTRPCRouter({
	byWorkspace: privateProcedure
		.input(selectWorkspaceFilesSchema)
		.query(async ({ input, ctx }) => {
			const { handle, limit, cursor, types, search, folder, excludeFolders } = input;

			console.log('filesByWorkspace input', input);

			const workspace = getUserWorkspaceByHandle(ctx.user, handle);

			const files = await ctx.db.http.query.Files.findMany({
				where: sqlAnd([
					eq(Files.workspaceId, workspace.id),
					eq(Files.uploadStatus, 'complete'),
					!!folder && eq(Files.folder, folder),
					!!excludeFolders?.length && notInArray(Files.folder, excludeFolders),
					notInArray(Files.folder, ['imports/fans']),
					// notInArray(Files.folder, ['avatars', 'product-images']),
					!!types?.length && inArray(Files.type, types),
					!!search?.length && sqlStringContains(Files.name, search),
					!!cursor &&
						or(
							lt(Files.createdAt, cursor.createdAt),
							and(eq(Files.createdAt, cursor.createdAt), gt(Files.id, cursor.id)),
						),
				]),
				orderBy: [desc(Files.createdAt), asc(Files.id)],
				limit: limit + 1,
			});

			console.log(
				'filesByWorkspace output',
				files.map(f => f.name),
			);

			let nextCursor: typeof cursor | undefined = undefined;

			if (files.length > limit) {
				const nextFile = files.pop();
				nextCursor =
					nextFile ?
						{
							id: nextFile?.id,
							createdAt: nextFile?.createdAt,
						}
					:	undefined;
			}

			return {
				files: files.slice(0, limit),
				nextCursor,
			};
		}),

	// uploadFileFromUrl: privateProcedure
	//     .input(z.object({
	//         fileUrl: z.string().url(),
	//         folder: z.string(),
	//     }))
	//     .mutation(async ({ input, ctx }) => {
	//         // fetch the file
	//         const response = await
	//     }),

	getPresigned: privateProcedure
		.input(
			z.object({
				files: z.array(uploadFileSchema),
				folder: z
					.string()
					.optional()
					.default('')
					.transform(v => v.replace(/^\/|\/$/g, '')), // remove leading and trailing slashes
				allowedFileTypes: z.array(z.enum(ALLOWED_FILE_TYPES)),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log('input => ', input);
			const dbFileRecords: FileRecord[] = [];

			const presigned: Presigned[] = [];

			await Promise.all(
				input.files.map(async f => {
					console.log('f', f);
					const fileId = newId('file');

					const s3Key = getFileKey({
						workspaceId: ctx.workspace.id,
						folder: input.folder,
						fileName: fileId.replace('file_', ''),
					});

					const fileType = getTypeFromFileName(
						f.name,
						input.allowedFileTypes,
					) as AllowedFileType;
					const fileContentType = lookup(f.name);

					if (!fileContentType) {
						throw new Error(`Could not determine file content type for ${f.name}`);
					}

					const fileRecord: FileRecord = {
						...f,
						id: fileId,
						workspaceId: ctx.workspace.id,
						bucket: env.AWS_S3_BUCKET_NAME,
						s3Key,
						folder: input.folder,
						createdById: ctx.user.id,
						uploadedById: ctx.user.id,
						internal: true,
						type: fileType,
						uploadStatus: 'pending',
						src: '',
					};

					dbFileRecords.push(fileRecord);

					const presignedFile = await getPresigned({
						fileRecord,
						workspaceId: ctx.workspace.id,
						s3Key,
						name: f.name,
						fileContentType,
						fileSizeInBytes: f.size,
					});
					presigned.push(presignedFile);
				}),
			);

			await ctx.db.http.insert(Files).values(dbFileRecords);

			return presigned;
		}),

	completeSinglePartUpload: privateProcedure
		.input(
			z.object({
				fileId: z.string(),
				s3Key: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const uploadedFiles = await ctx.db.http
				.update(Files)
				.set({
					uploadStatus: 'complete',
					src: `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${input.s3Key}`,
				})
				.where(and(eq(Files.workspaceId, ctx.workspace.id), eq(Files.id, input.fileId)))
				.returning();

			await incrementWorkspaceFileUsage(
				ctx.workspace.id,
				getTotalUploadSize(uploadedFiles),
				ctx.db,
			);

			return uploadedFiles[0] ?? raise('File not found');
		}),

	completeMultiPartUpload: privateProcedure
		.input(
			z.object({
				fileId: z.string(),
				s3Key: z.string(),
				uploadId: z.string(),
				parts: z.array(z.object({ tag: z.string(), partNumber: z.number() })),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log('completing multipart upload', input);
			await completeMultipartUpload(input);

			const uploadedFiles = await ctx.db.http
				.update(Files)
				.set({
					uploadStatus: 'complete',
					src: `https://${env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${input.s3Key}`,
				})
				.where(and(eq(Files.workspaceId, ctx.workspace.id), eq(Files.id, input.fileId)))
				.returning();

			await incrementWorkspaceFileUsage(
				ctx.workspace.id,
				getTotalUploadSize(uploadedFiles),
				ctx.db,
			);

			return uploadedFiles[0] ?? raise('File not found');
		}),
});
