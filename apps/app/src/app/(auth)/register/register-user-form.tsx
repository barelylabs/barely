'use client';

import type { z } from 'zod/v4';
import { useState } from 'react';
import Link from 'next/link';
import { useZodForm } from '@barely/hooks';
import {
	emailInUseMessage,
	newUserContactInfoSchema,
	phoneNumberInUseMessage,
} from '@barely/validators';
import { isPossiblePhoneNumber, isRealEmail } from '@barely/validators/helpers';
import { useMutation } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { PhoneField } from '@barely/ui/forms/phone-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Text } from '@barely/ui/typography';

import { LoginLinkSent } from '../login-success';

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

const RegisterUserForm = ({ callbackUrl }: RegisterFormProps) => {
	const trpc = useTRPC();
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

	const sendLoginEmail = useMutation({
		...trpc.auth.sendLoginEmail.mutationOptions(),
		onSuccess: () => setLoginEmailSent(true),
	});

	const createUser = useMutation({
		...trpc.user.create.mutationOptions(),
		onSuccess: newUser => {
			// if (!newUser) throw new Error('No user returned from createUser mutation');

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
