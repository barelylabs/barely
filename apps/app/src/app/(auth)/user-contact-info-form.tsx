import { ReactNode, useEffect } from 'react';

import Link from 'next/link';

import {
	fieldAtom,
	formAtom,
	useFieldActions,
	useFieldValue,
	useForm,
	useFormValues,
} from 'form-atoms';
import { atom, useAtom } from 'jotai';
import { z } from 'zod';

import {
	firstNameFieldAtom,
	lastNameFieldAtom,
	userTypeFieldAtom,
} from '@barely/api/user/user.atoms';
import { userContactInfoSchema } from '@barely/api/user/user.schema';
import { atomWithDebounce } from '@barely/atoms/debounce.atom';

import { Form, SubmitButton } from '@barely/ui/elements/form';
import { Label } from '@barely/ui/elements/label';
import { PhoneField } from '@barely/ui/elements/phone-field';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@barely/ui/elements/select';
import { TextField } from '@barely/ui/elements/text-field';
import { Text } from '@barely/ui/elements/typography';

import { isPossiblePhoneNumber } from '@barely/utils/edge/phone-number';

import { api } from '~/client/trpc';

const { debouncedValueAtom: debouncedEmailQueryAtom } = atomWithDebounce('');
const { debouncedValueAtom: debouncedPhoneQueryAtom } = atomWithDebounce('');

const emailExistsAtom = atom(false);
const phoneExistsAtom = atom(false);

const emailFieldAtom = fieldAtom({
	name: 'email',
	value: '',
	validate: ({ get, value: email, event, touched }) => {
		if (event === 'change' && !touched) return undefined;
		if (!email) return ['An email is required'];
		const parsedEmail = userContactInfoSchema.shape.email.safeParse(email);
		if (!parsedEmail.success) return ['Invalid email'];

		const emailExists = get(emailExistsAtom);
		console.log('emailExists in validate => ', emailExists);

		if (emailExists === true) return ['That email is taken. Please login.'];

		return [];
	},
});

const phoneFieldAtom = fieldAtom({
	name: 'phone',
	value: '',
	validate: ({ get, value: phone, event, touched }) => {
		console.log('phone in validate => ', phone);
		if (event === 'change' && !touched) return undefined;
		const parsedPhone = userContactInfoSchema.shape.phone.safeParse(phone);
		if (!parsedPhone.success) return ['Invalid phone number'];
		if (!phone) return [];
		const phoneExists = get(phoneExistsAtom);
		console.log('phoneExists in validate => ', phoneExists);

		if (phoneExists === true) return ['That phone number is taken.'];

		return [];
	},
});

const userContactInfoFormAtom = formAtom({
	email: emailFieldAtom,
	firstName: firstNameFieldAtom,
	lastName: lastNameFieldAtom,
	phone: phoneFieldAtom,
	type: userTypeFieldAtom,
});

interface UserContactInfoFormProps {
	onSubmit: (data: z.infer<typeof userContactInfoSchema>) => void | Promise<void>;
	submitLabel?: ReactNode;
	newUser?: boolean;
}

const UserContactInfoForm = ({
	newUser,
	submitLabel,
	onSubmit,
}: UserContactInfoFormProps) => {
	const user = useFormValues(userContactInfoFormAtom);
	const { fieldAtoms } = useForm(userContactInfoFormAtom);

	// 📧 check if email exists
	const emailFieldActions = useFieldActions(emailFieldAtom);

	const [debouncedEmailQuery, setEmailQuery] = useAtom(debouncedEmailQueryAtom);
	useEffect(() => setEmailQuery(user.email), [user.email, setEmailQuery]);
	const { data: emailQueryExists } = api.edge.user.emailExists.useQuery(
		{
			email: debouncedEmailQuery,
		},
		{
			enabled:
				!!debouncedEmailQuery &&
				userContactInfoSchema.shape.email.safeParse(debouncedEmailQuery).success,
			cacheTime: 1000 * 60 * 5, // 5 minutes
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	);

	const [, setEmailExists] = useAtom(emailExistsAtom);

	useEffect(() => {
		if (emailQueryExists === undefined) return;
		if (emailQueryExists) setEmailExists(true);
		if (emailQueryExists === false) setEmailExists(false);
		emailFieldActions.validate();
	}, [emailQueryExists, setEmailExists, emailFieldActions]);

	// 📞 check if phone exists
	const phoneFieldActions = useFieldActions(phoneFieldAtom);

	const [debouncedPhoneQuery, setPhoneQuery] = useAtom(debouncedPhoneQueryAtom);
	useEffect(() => setPhoneQuery(user.phone ?? ''), [user.phone, setPhoneQuery]);

	const { data: phoneQueryExists } = api.edge.user.phoneExists.useQuery(
		{
			phone: debouncedPhoneQuery,
		},
		{
			enabled: !!debouncedPhoneQuery && isPossiblePhoneNumber(debouncedPhoneQuery),
			cacheTime: 1000 * 60 * 5, // 5 minutes
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	);

	const [, setPhoneExists] = useAtom(phoneExistsAtom);
	useEffect(() => {
		console.log('user.phone => ', user.phone);
		if (phoneQueryExists === undefined) return;
		if (!user.phone || !user.phone.length || phoneQueryExists === false) {
			console.log('setting phoneExists to false');
			setPhoneExists(false);
		}
		if (phoneQueryExists) setPhoneExists(true);
		phoneFieldActions.validate();
	}, [user.phone, phoneQueryExists, setPhoneExists, phoneFieldActions]);

	// useEffect(() => console.log('user.phone => ', user.phone), [user]);

	// controlled userType select
	const userType = useFieldValue(userTypeFieldAtom);
	const userTypeFieldActions = useFieldActions(userTypeFieldAtom);

	return (
		<Form formAtom={userContactInfoFormAtom} onSubmit={onSubmit}>
			{/* <pre>{JSON.stringify(user, null, 2)}</pre>
			emailExists: {emailExists ? 'true' : 'false'}
			<br />
			phoneExists: {phoneExists ? 'true' : 'false'} */}
			<div className='flex flex-col space-y-2'>
				<TextField fieldAtom={fieldAtoms.firstName} size='sm' label='First name' />
				<TextField fieldAtom={fieldAtoms.lastName} size='sm' label='Last name' />
				<TextField
					fieldAtom={emailFieldAtom}
					size='sm'
					label='Email'
					type='email'
					autoCorrect='off'
					autoComplete='email'
					autoCapitalize='off'
				/>
				<div>
					<Label>Role</Label>
					<Select
						value={userType}
						onValueChange={value => {
							const type = userContactInfoSchema.shape.type.safeParse(value);
							type.success && userTypeFieldActions.setValue(type.data);
						}}
					>
						<SelectTrigger>
							<SelectValue placeholder='Role' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='artist'>Artist</SelectItem>
							<SelectItem value='creator'>Creator</SelectItem>
							<SelectItem value='label'>Label</SelectItem>
							<SelectItem value='marketer'>Marketer</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<PhoneField fieldAtom={phoneFieldAtom} size='sm' label='Phone' type='tel' />
			</div>
			<div className='flex flex-col space-y-4 py-4'>
				<SubmitButton formAtom={userContactInfoFormAtom}>
					{submitLabel ?? 'Submit'}
				</SubmitButton>
				{newUser && (
					<Text variant='sm/light' subtle className='text-center'>
						I already have an account.{' '}
						<span className='dark:text-slate-300 underline'>
							<Link href='/login'>Login</Link>
						</span>
					</Text>
				)}
			</div>
		</Form>
	);
};

export { UserContactInfoForm, userContactInfoFormAtom };
