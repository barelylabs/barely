'use client';

import type { Control, FieldValues, UseFormProps } from 'react-hook-form';
import type { ZodType } from 'zod/v4';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm as __useForm } from 'react-hook-form';

export function useZodForm<TOut extends FieldValues, TIn extends FieldValues>(
	props: Omit<UseFormProps<TIn, unknown, TOut>, 'resolver'> & {
		schema: ZodType<TOut, TIn>;
	},
) {
	const form = __useForm<TIn, unknown, TOut>({
		...props,
		resolver: standardSchemaResolver(props.schema, undefined),
	});

	return form;
}

export type ZodFormControl<T extends FieldValues> = Control<T>;
