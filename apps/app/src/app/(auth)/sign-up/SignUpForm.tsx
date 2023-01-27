'use client';

import { useZodForm } from '@barely/hooks';
import { Form } from '@barely/ui/src/Form';
import { TextInput } from '@barely/ui/src/TextInput';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';

import { userCreateSchema } from '@barely/schema/db';

import { useSignUp } from '@clerk/nextjs';

import { trpc } from '~/utils/trpc';

function SignUpForm() {
	const signUpSchema = userCreateSchema.pick({
		email: true,
		firstName: true,
		lastName: true,
	});

	const zForm = useZodForm({
		schema: signUpSchema,
		defaultValues: {
			email: '',
			firstName: '',
			lastName: '',
		},
	});

	const { register, formState } = zForm;
	const createUser = trpc.user.create.useMutation();

	const searchParams = useSearchParams();
	const router = useRouter();

	const { isLoaded, signUp } = useSignUp();

	if (!isLoaded) {
		return null;
	}

	type SignUpProps = z.infer<typeof signUpSchema>;

	const onSubmit = async (props: SignUpProps) => {
		const { firstName, lastName, email } = props;
		// console.log('email for login link => ', email);

		const signUpResponse = await signUp.create({
			firstName,
			lastName,
			emailAddress: email,
		});

		console.log('signUpResponse => ', signUpResponse);

		if (!signUpResponse || !signUpResponse.createdUserId) {
			throw new Error('signUpResponse is null');
		}

		const newDbUser = await createUser.mutateAsync({
			id: signUpResponse.createdUserId,
			firstName,
			lastName,
			email,
			type: 'artist', // todo add select option
		});

		console.log('newDbUser => ', newDbUser);
	};

	return (
		<>
			<Form form={zForm} onSubmit={onSubmit}>
				<div>
					<div className='mt-1'>
						<TextInput
							label='First name'
							labelPosition='overlap'
							size='sm'
							error={formState.errors.email?.message}
							{...register('firstName')}
						/>
						<TextInput
							label='Last name'
							labelPosition='overlap'
							size='sm'
							error={formState.errors.email?.message}
							{...register('lastName')}
						/>
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
						Continue
					</button>
				</div>
			</Form>
		</>
	);
}

export default SignUpForm;
