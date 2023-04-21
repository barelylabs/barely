'use client';

import { useState } from 'react';

import Link from 'next/link';

import { formAtom } from 'form-atoms';
import { z } from 'zod';

import { emailFieldAtom } from '@barely/api/user/user.atoms';
import { userSchema } from '@barely/api/user/user.schema';

import { Form, SubmitButton } from '@barely/ui/elements/form';
import { TextField } from '@barely/ui/elements/text-field';
import { Text } from '@barely/ui/elements/typography';

import { api } from '~/client/trpc';

import { LoginLinkSent } from '../login-success';

const signInSchema = userSchema.pick({ email: true });

const loginFormAtom = formAtom({
	email: emailFieldAtom,
});

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

const LoginForm = ({ callbackUrl }: RegisterFormProps) => {
	const sendLoginEmail = api.node.auth.sendLoginEmail.useMutation({
		onSuccess: () => {
			setLoginEmailSent(true);
		},
	});

	const [loginEmailSent, setLoginEmailSent] = useState(false);
	const [identifier, setIdentifier] = useState('');

	const onSubmit = async (user: z.infer<typeof signInSchema>) => {
		setIdentifier(user.email);
		await sendLoginEmail.mutateAsync({ email: user.email, callbackUrl });
		return;
	};

	return (
		<>
			{loginEmailSent ? (
				<LoginLinkSent identifier={identifier} provider='email' />
			) : (
				<Form formAtom={loginFormAtom} onSubmit={onSubmit}>
					<p className='text-sm text-slate-600 dark:text-slate-400'>
						Enter your email address
					</p>
					<TextField
						fieldAtom={emailFieldAtom}
						// label='Email'
						size='sm'
						type='email'
						autoCorrect='off'
						autoComplete='email'
						autoCapitalize='off'
						placeholder='name@example.com'
					/>
					<SubmitButton size='sm' formAtom={loginFormAtom}>
						Login with email 🚀
					</SubmitButton>
					<Text variant={'sm/normal'} subtle underline>
						<Link href='/register' className='hover:text-brand'>
							{`Don't have an account? Sign Up`}
						</Link>
					</Text>
				</Form>
			)}
		</>
	);
};

export default LoginForm;
