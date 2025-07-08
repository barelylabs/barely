'use client';

import type { z } from 'zod/v4';
import { useState } from 'react';
import Link from 'next/link';
import { useZodForm } from '@barely/hooks';
import { insertUserSchema } from '@barely/validators';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { Text } from '@barely/ui/typography';

import { authClient } from '~/auth/client';
import { LoginLinkSent } from '../login-success';

const signInSchema = insertUserSchema.pick({ email: true });

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

export const LoginForm = ({ callbackUrl }: RegisterFormProps) => {
	const form = useZodForm({
		schema: signInSchema,
		defaultValues: {
			email: '',
		},
	});

	const [loginEmailSent, setLoginEmailSent] = useState(false);

	const onSubmit = async (user: z.infer<typeof signInSchema>) => {
		const { data } = await authClient.signIn.magicLink({
			email: user.email,
			callbackURL: callbackUrl,
		});

		if (data?.status === true) {
			setLoginEmailSent(true);
		}
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
