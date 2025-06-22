'use client';

import type { z } from 'zod/v4';
import { useState } from 'react';
import Link from 'next/link';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { insertUserSchema } from '@barely/lib/server/routes/user/user.schema';
import { useTRPC } from '@barely/server/api/react';
import { useMutation } from '@tanstack/react-query';

import { Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { TextField } from '@barely/ui/forms/text-field';

import { LoginLinkSent } from '../login-success';

const signInSchema = insertUserSchema.pick({ email: true });

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

export const LoginForm = ({ callbackUrl }: RegisterFormProps) => {
	const trpc = useTRPC();

	const form = useZodForm({
		schema: signInSchema,
		defaultValues: {
			email: '',
		},
	});

	const [loginEmailSent, setLoginEmailSent] = useState(false);

	const { mutateAsync: sendLoginEmail } = useMutation(
		trpc.auth.sendLoginEmail.mutationOptions({
			onSuccess: () => {
				setLoginEmailSent(true);
			},
		}),
	);

	const onSubmit = async (user: z.infer<typeof signInSchema>) => {
		await sendLoginEmail({ email: user.email, callbackUrl });
		return;
	};

	return (
		<>
			{loginEmailSent ?
				<LoginLinkSent identifier={form.watch('email')} provider='email' />
			:	<Form form={form} onSubmit={onSubmit} className='gap-4'>
					<Text variant='sm/normal' subtle>
						Enter your email address
					</Text>

					<TextField
						type='email'
						autoCorrect='off'
						autoComplete='email'
						autoCapitalize='off'
						name='email'
						control={form.control}
						placeholder='name@example.com'
					/>

					<SubmitButton fullWidth loadingText='Sending login link...'>
						Login with email 🚀
					</SubmitButton>
					<Text variant={'sm/normal'} subtle underline>
						<Link href='/register' className='hover:text-brand'>
							{`Don't have an account? Sign Up`}
						</Link>
					</Text>
				</Form>
			}
		</>
	);
};
