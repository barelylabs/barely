import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormProps } from 'react-hook-form';
import { z } from 'zod';

//https://kitchen-sink.trpc.io/react-hook-form?file=feature%2Freact-hook-form%2Findex.tsx#content

export function useZodForm<TSchema extends z.ZodType>(
	props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & {
		schema: TSchema;
	},
) {
	const form = useForm<TSchema['_input']>({
		...props,
		resolver: zodResolver(props.schema, undefined),
	});

	return form;
}
