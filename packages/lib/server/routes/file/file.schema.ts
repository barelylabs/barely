// import type { extensions } from "@uploadthing/mime-types";
// import type { AllowedFileType, ContentDisposition } from "@uploadthing/shared";
import { ALLOWED_FILE_TYPES } from '@uploadthing/shared';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { querySelectionSchema } from '../../../utils/zod-helpers';
import { Files } from './file.sql';

export const insertFileSchema = createInsertSchema(Files, {
	width: z.coerce.number().nullish(),
	height: z.coerce.number().nullish(),
	duration: z.coerce.number().nullish(),
	fps: z.coerce.number().nullish(),
});
export const createFileSchema = insertFileSchema.omit({ id: true });
export const upsertFileSchema = insertFileSchema.partial({ id: true });
export const updateFileSchema = insertFileSchema.partial().required({ id: true });

export const selectWorkspaceFilesSchema = z.object({
	handle: z.string(),
	folder: z.string().optional(),
	types: z.array(z.enum(ALLOWED_FILE_TYPES)).optional(),
	search: z.string().optional(),
	showArchived: z.boolean().optional(),
	cursor: z.object({ id: z.string(), createdAt: z.coerce.date() }).optional(),
	limit: z.coerce.number().min(1).max(100).optional().default(20),
});
export const selectFileSchema = createSelectSchema(Files);

export type FileRecord = z.infer<typeof insertFileSchema>;
export type CreateFileRecord = z.infer<typeof createFileSchema>;
export type UpsertFileRecord = z.infer<typeof upsertFileSchema>;
export type UpdateFileRecord = z.infer<typeof updateFileSchema>;
export type SelectFileRecord = z.infer<typeof selectFileSchema>;

export type Image = Required<
	Pick<FileRecord, 'id' | 'name' | 'src' | 'key'> & {
		width: number;
		height: number;
	}
>;

// public
export const publicFileSchema = selectFileSchema.pick({
	id: true,
	name: true,
	type: true,
	extension: true,
	src: true,
	key: true,
	size: true,
	width: true,
	height: true,
	fps: true,
	duration: true,
});

export type PublicFile = z.infer<typeof publicFileSchema>;

export const publicImageSchema = publicFileSchema
	.pick({
		id: true,
		name: true,
		// src: true,
		key: true,
		size: true,
	})
	.extend({
		width: publicFileSchema.shape.width.unwrap(),
		height: publicFileSchema.shape.height.unwrap(),
	});

export type PublicImage = z.infer<typeof publicImageSchema>;

export const publicAudioSchema = publicFileSchema
	.pick({
		id: true,
		name: true,
		src: true,
		size: true,
	})
	.extend({
		duration: publicFileSchema.shape.duration.unwrap(),
	});

export type PublicAudio = z.infer<typeof publicAudioSchema>;

export const publicVideoSchema = publicFileSchema
	.pick({
		id: true,
		name: true,
		src: true,
		size: true,
	})
	.extend({
		width: publicFileSchema.shape.width.unwrap(),
		height: publicFileSchema.shape.height.unwrap(),
		duration: publicFileSchema.shape.duration.unwrap(),
		fps: publicFileSchema.shape.fps.unwrap(),
	});

export type PublicVideo = z.infer<typeof publicVideoSchema>;
// export type PublicVideo = Required< Pick<
//   PublicFile,
//   "id" | "name" | "src" | "size" | "duration" | "fps"
// >, 'size' >

// uploads
export const uploadFileSchema = insertFileSchema.pick({
	name: true,
	size: true,
	width: true,
	height: true,
	duration: true,
	fps: true,
});

export type UploadFile = z.infer<typeof uploadFileSchema>;

// sortable
export interface SortableFile extends FileRecord {
	lexorank: string;
}

export interface SortableFilePendingUpload extends SortableFile {
	pendingUpload: true;
	previewImage?: string;
}

export function isSortableFilePendingUpload(
	file: SortableFile | SortableFilePendingUpload,
): file is SortableFilePendingUpload {
	return 'pendingUpload' in file;
}

// query params

export const fileFilterParamsSchema = selectWorkspaceFilesSchema.omit({
	handle: true,
	cursor: true,
});

export const fileSearchParamsSchema = fileFilterParamsSchema.extend({
	selectedFileIds: querySelectionSchema.optional(),
});
