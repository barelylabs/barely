'use client';

import { useZodForm } from '@barely/hooks';
import { Form } from '@barely/ui/src/Form';
import { TextInput } from '@barely/ui/src/TextInput';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { trpc } from '~/utils/trpc';

function SignInForm() {
	const zForm = useZodForm({
		schema: z.object({ email: z.string().email() }),
	});
	const { register, formState } = zForm;

	const searchParams = useSearchParams();
	const router = useRouter();

	const [loginLinkError, setLoginLinkError] = useState<string | null>(null);

	useEffect(() => {
		const token = searchParams.get('token');
		const callbackUrl = searchParams.get('callbackUrl') ?? '/campaigns';
		if (token) {
			console.log('signing in with token => ', token);
			signIn('credentials', { redirect: false, token, callbackUrl }).then(res => {
				console.log('signin res => ', res);
				if (!res) return setLoginLinkError('Invalid login link');
				if (res.error) return setLoginLinkError(res.error);
				router.push('/campaigns');
			});
		}
	}, [searchParams, router]);

	// const userQuery = trpc.auth.getUser.useQuery();

	// const sendEmailLoginLink = trpc.auth.sendEmailLoginLink.useMutation({});

	const onSubmit = async ({ email }: { email: string }) => {
		console.log('email for login link => ', email);
		// await sendEmailLoginLink.mutateAsync({
		// 	email,
		// 	callbackUrl: '/campaigns',
		// });
	};

	return (
		<>
			<Form form={zForm} onSubmit={onSubmit}>
				<div>
					<div className='mt-1'>
						<TextInput
							label='Email address'
							labelPosition='overlap'
							size='sm'
							error={formState.errors.email?.message}
							{...register('email')}
						/>
					</div>
				</div>

				<div>
					<button
						type='submit'
						className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
					>
						Sign in
					</button>
				</div>
			</Form>
		</>
	);
}

export default SignInForm;
