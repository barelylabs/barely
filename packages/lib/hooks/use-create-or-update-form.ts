'use client';

import type { z } from 'zod/v4';

import { useZodForm } from './use-zod-form';

interface ItemWithId {
	id: string;
}

interface CreateOrEditUpdateProps<Z extends z.ZodTypeAny> {
	updateItem: (z.infer<Z> & ItemWithId) | null;
	upsertSchema: Z;
	defaultValues: z.infer<Z>;
	handleCreateItem: (data: z.infer<Z>) => Promise<void>;
	handleUpdateItem: (data: z.infer<Z> & ItemWithId) => Promise<void>;
}

export function useCreateOrUpdateForm<Z extends z.ZodTypeAny>({
	updateItem,
	upsertSchema,
	defaultValues,
	handleCreateItem,
	handleUpdateItem,
}: CreateOrEditUpdateProps<Z>) {
	const form = useZodForm({
		schema: upsertSchema,
		values: updateItem ?? defaultValues,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted values
		},
	});

	const onSubmit = async (data: z.infer<Z>) => {
		if (updateItem) {
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
