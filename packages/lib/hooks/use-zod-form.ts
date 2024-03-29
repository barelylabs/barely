/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UseFormProps } from 'react-hook-form';
import type { TypeOf, ZodSchema } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface UseZodFormProps<Z extends ZodSchema<any>> extends UseFormProps<TypeOf<Z>> {
	schema: Z;
}

export const useZodForm = <Z extends ZodSchema<any>>({
	schema,
	...formConfig
}: UseZodFormProps<Z>) => {
	return useForm({
		...formConfig,
		resolver: zodResolver(schema),
	});
};
