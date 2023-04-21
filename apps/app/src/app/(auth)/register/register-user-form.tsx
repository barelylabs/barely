'use client';

import { useState } from 'react';

import { z } from 'zod';

import { userContactInfoSchema } from '@barely/lib/api/user/user.schema';

import { api } from '~/client/trpc';

import { LoginLinkSent } from '../login-success';
import { UserContactInfoForm } from '../user-contact-info-form';

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

const RegisterUserForm = ({ callbackUrl }: RegisterFormProps) => {
	const createUser = api.node.user.create.useMutation({
		onSuccess: newUser => {
			setIdentifier(newUser.email);
			sendLoginEmail.mutate({ email: newUser.email, callbackUrl });
		},
	});
	const sendLoginEmail = api.node.auth.sendLoginEmail.useMutation({
		onSuccess: () => setLoginEmailSent(true),
	});
	const [loginEmailSent, setLoginEmailSent] = useState(false);
	const [identifier, setIdentifier] = useState('');

	const onSubmit = (user: z.infer<typeof userContactInfoSchema>) => {
		return createUser.mutate({ ...user });
	};

	return (
		<>
			{loginEmailSent ? (
				<LoginLinkSent identifier={identifier} provider='email' />
			) : (
				<>
					<p className='text-sm text-slate-600 dark:text-slate-400'>
						Enter your contact info to create an account
					</p>
					<UserContactInfoForm
						submitLabel='Create my account 🚀'
						onSubmit={onSubmit}
						newUser
					/>
				</>
			)}
		</>
	);
};

export default RegisterUserForm;
