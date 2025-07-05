'use client';

import type { FieldValues } from 'react-hook-form';
import type { ZodType } from 'zod/v4';

import { useZodForm } from './use-zod-form';

interface ItemWithId {
	id: string;
}

interface CreateOrEditUpdateProps<TOut extends FieldValues, TIn extends FieldValues> {
	updateItem: (TIn & ItemWithId) | null;
	upsertSchema: ZodType<TOut, TIn>;
	defaultValues: TIn;
	handleCreateItem: (data: TIn) => Promise<void>;
	handleUpdateItem: (data: TIn & ItemWithId) => Promise<void>;
}

// export function useCreateOrUpdateForm<Z extends z.ZodTypeAny>({
export function useCreateOrUpdateForm<TOut extends FieldValues, TIn extends FieldValues>({
	updateItem,
	upsertSchema,
	defaultValues,
	handleCreateItem,
	handleUpdateItem,
}: CreateOrEditUpdateProps<TOut, TIn>) {
	const form = useZodForm({
		schema: upsertSchema,
		values: updateItem ?? defaultValues,
		resetOptions: {
			keepDirtyValues: true, // retain user-interacted values
		},
	});

	const onSubmit = async (data: TIn) => {
		if (updateItem && 'id' in updateItem) {
			await handleUpdateItem({ ...data, id: updateItem.id });
		} else {
			await handleCreateItem(data);
		}
	};

	return {
		form,
		onSubmit,
	};
}
