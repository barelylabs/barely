import type { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { Files } from "./file.sql";

export const insertFileSchema = createInsertSchema(Files);
export const createFileSchema = insertFileSchema.omit({ id: true });
export const upsertFileSchema = insertFileSchema.partial({ id: true });
export const updateFileSchema = insertFileSchema
  .partial()
  .required({ id: true });

export const selectFileSchema = createSelectSchema(Files);

export type File = z.infer<typeof insertFileSchema>;
export type CreateFile = z.infer<typeof createFileSchema>;
export type UpsertFile = z.infer<typeof upsertFileSchema>;
export type UpdateFile = z.infer<typeof updateFileSchema>;
export type SelectFile = z.infer<typeof selectFileSchema>;

// public
export const publicFileSchema = selectFileSchema.pick({
  id: true,
  name: true,
  type: true,
  extension: true,
  url: true,
  size: true,
  width: true,
  height: true,
  fps: true,
  duration: true,
});

export type PublicFile = z.infer<typeof publicFileSchema>;
