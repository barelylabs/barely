import type { Presigned } from '@barely/files';
import type { FileRecord } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import type { AllowedFileType } from '@uploadthing/shared';
import { dbHttp } from '@barely/db/client';
import { Files } from '@barely/db/sql/file.sql';
import { sqlAnd, sqlStringContains } from '@barely/db/utils';
import {
	completeMultipartUpload,
	getFileKey,
	getPresigned,
	getTotalUploadSize,
} from '@barely/files';
import { newId, raise } from '@barely/utils';
import { selectWorkspaceFilesSchema, uploadFileSchema } from '@barely/validators';
import { lookup } from '@uploadthing/mime-types';
import { ALLOWED_FILE_TYPES, getTypeFromFileName } from '@uploadthing/shared';
import { and, asc, desc, eq, gt, inArray, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getUserWorkspaceByHandle } from '@barely/auth/utils';

import { libEnv } from '../../../env';
import { incrementWorkspaceFileUsage } from '../../functions/workspace.fns';
import { privateProcedure, workspaceProcedure } from '../trpc';

export const fileRoute = {
	byWorkspace: privateProcedure
		.input(selectWorkspaceFilesSchema)
		.query(async ({ input, ctx }) => {
			const { handle, limit, cursor, types, search, folder, excludeFolders } = input;

			console.log('filesByWorkspace input', input);

			const workspace = getUserWorkspaceByHandle(ctx.user, handle);

			const files = await dbHttp.query.Files.findMany({
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
							id: nextFile.id,
							createdAt: nextFile.createdAt,
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

	getPresigned: workspaceProcedure
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
						bucket: libEnv.AWS_S3_BUCKET_NAME,
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

			await dbHttp.insert(Files).values(dbFileRecords);

			return presigned satisfies Presigned[];
		}),

	completeSinglePartUpload: workspaceProcedure
		.input(
			z.object({
				fileId: z.string(),
				s3Key: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const uploadedFiles = await dbHttp
				.update(Files)
				.set({
					uploadStatus: 'complete',
					src: `https://${libEnv.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${input.s3Key}`,
				})
				.where(and(eq(Files.workspaceId, ctx.workspace.id), eq(Files.id, input.fileId)))
				.returning();

			await incrementWorkspaceFileUsage(
				ctx.workspace.id,
				getTotalUploadSize(uploadedFiles),
				ctx.pool,
			);

			return uploadedFiles[0] ?? raise('File not found');
		}),

	completeMultiPartUpload: workspaceProcedure
		.input(
			z.object({
				handle: z.string(),
				fileId: z.string(),
				s3Key: z.string(),
				uploadId: z.string(),
				parts: z.array(z.object({ tag: z.string(), partNumber: z.number() })),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log('completing multipart upload', input);
			await completeMultipartUpload(input);

			const uploadedFiles = await dbHttp
				.update(Files)
				.set({
					uploadStatus: 'complete',
					src: `https://${libEnv.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${input.s3Key}`,
				})
				.where(and(eq(Files.workspaceId, ctx.workspace.id), eq(Files.id, input.fileId)))
				.returning();

			await incrementWorkspaceFileUsage(
				ctx.workspace.id,
				getTotalUploadSize(uploadedFiles),
				ctx.pool,
			);

			return uploadedFiles[0] ?? raise('File not found');
		}),
} satisfies TRPCRouterRecord;

// re-export Presigned type.
export type { Presigned };
