'use client';

import type { z } from 'zod';
import { useState } from 'react';
import Link from 'next/link';
import {
	emailInUseMessage,
	newUserContactInfoSchema,
	phoneNumberInUseMessage,
} from '@barely/lib/server/routes/user/user.schema';

import { api } from '@barely/api/react';

import { useZodForm } from '@barely/hooks/use-zod-form';

import { Text } from '@barely/ui/elements/typography';
import { Form, SubmitButton } from '@barely/ui/forms';
import { PhoneField } from '@barely/ui/forms/phone-field';
import { TextField } from '@barely/ui/forms/text-field';

import { isRealEmail } from '@barely/utils/email';
import { isPossiblePhoneNumber } from '@barely/utils/phone-number';

import { LoginLinkSent } from '../login-success';

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

const RegisterUserForm = ({ callbackUrl }: RegisterFormProps) => {
	const [identifier, setIdentifier] = useState('');
	const [creatingAccount, setCreatingAccount] = useState(false);
	const [loginEmailSent, setLoginEmailSent] = useState(false);

	const form = useZodForm({
		schema: newUserContactInfoSchema,
		defaultValues: {
			fullName: '',
			email: '',
			phone: '',
		},
	});

	const sendLoginEmail = api.auth.sendLoginEmail.useMutation({
		onSuccess: () => setLoginEmailSent(true),
	});

	const createUser = api.user.create.useMutation({
		onSuccess: newUser => {
			if (!newUser) throw new Error('No user returned from createUser mutation');

			setIdentifier(newUser.email);
			sendLoginEmail.mutate({ email: newUser.email, callbackUrl });
		},
	});

	const onSubmit = async (user: z.infer<typeof newUserContactInfoSchema>) => {
		setCreatingAccount(true);
		await createUser.mutateAsync({ ...user });
		return;
	};

	const [validatingEmail, setValidatingEmail] = useState(false);

	return (
		<>
			{loginEmailSent ?
				<LoginLinkSent identifier={identifier} provider='email' />
			: creatingAccount ?
				<p className='text-sm text-subtle-foreground'>Creating your account...</p>
			:	<>
					<p className='text-sm text-subtle-foreground'>
						Enter your contact info to create an account
					</p>

					<Form form={form} onSubmit={onSubmit}>
						<div className='flex flex-col space-y-1'>
							<TextField control={form.control} name='fullName' label='Name' />

							<TextField
								control={form.control}
								name='email'
								label='Email'
								type='email'
								autoCorrect='off'
								autoComplete='email'
								autoCapitalize='off'
								onChange={e => {
									if (isRealEmail(e.target.value)) setValidatingEmail(true);
								}}
								onChangeDebounced={async e => {
									if (isRealEmail(e.target.value)) await form.trigger('email');

									if (
										form.formState.isSubmitted ||
										form.formState.errors.email?.message === emailInUseMessage
									)
										await form.trigger('email');
									setValidatingEmail(false);
								}}
								isValidating={validatingEmail}
							/>

							<PhoneField
								control={form.control}
								name='phone'
								label='Phone (optional)'
								hint='We will only use this to contact you about your account.'
								onChangeDebounced={async (e: React.ChangeEvent<HTMLInputElement>) => {
									if (!e.target.value.length) {
										await form.trigger('phone');
										return;
									}

									const phoneIsReal = isPossiblePhoneNumber(e.target.value);

									if (phoneIsReal) await form.trigger('phone');

									if (
										!phoneIsReal &&
										(form.formState.errors.phone?.message === phoneNumberInUseMessage ||
											form.formState.isSubmitted)
									)
										await form.trigger('phone');
								}}
							/>
						</div>

						<div className='flex flex-col space-y-4 py-4'>
							<SubmitButton fullWidth>Create my account 🚀</SubmitButton>

							<Text variant='sm/light' subtle className='text-center'>
								I already have an account.{' '}
								<span className='underline dark:text-slate-300'>
									<Link href='/login'>Login</Link>
								</span>
							</Text>
						</div>
					</Form>
				</>
			}
		</>
	);
};

export default RegisterUserForm;
