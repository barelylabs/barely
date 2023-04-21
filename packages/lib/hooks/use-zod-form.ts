/* eslint-disable @typescript-eslint/no-explicit-any */

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';
import { TypeOf, ZodSchema } from 'zod';

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
