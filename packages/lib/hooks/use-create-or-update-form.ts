"use client";

import type { z } from "zod";

import { useZodForm } from "./use-zod-form";

interface ItemWithId {
  id: string;
}

interface CreateOrEditUpdateProps<Z extends z.ZodTypeAny> {
  editItem: (z.infer<Z> & ItemWithId) | null;
  upsertSchema: Z;
  defaultValues: z.infer<Z>;
  handleCreateItem: (data: z.infer<Z>) => Promise<void>;
  handleUpdateItem: (data: z.infer<Z> & ItemWithId) => Promise<void>;
}

export function useCreateOrUpdateForm<Z extends z.ZodTypeAny>({
  editItem,
  upsertSchema,
  defaultValues,
  handleCreateItem,
  handleUpdateItem,
}: CreateOrEditUpdateProps<Z>) {
  const form = useZodForm({
    schema: upsertSchema,
    values: editItem ?? defaultValues,
    resetOptions: {
      keepDirtyValues: true, // retain user-interacted values
    },
  });

  const onSubmit = async (data: z.infer<Z>) => {
    if (editItem) {
      await handleUpdateItem(data);
    } else {
      await handleCreateItem(data);
    }
  };

  return {
    form,
    onSubmit,
  };
}
