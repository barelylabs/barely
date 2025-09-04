import { z } from 'zod/v4';

export const UPLOAD_TAB_VALUES = ['upload', 'library'] as const;
export const uploadTabSchema = z.enum(UPLOAD_TAB_VALUES);
export type UploadTab = z.infer<typeof uploadTabSchema>;
