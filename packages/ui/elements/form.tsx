'use client';

import { ComponentProps, ReactNode, useId } from 'react';

import {
	FieldAtom,
	FormAtom,
	FormFields,
	FormFieldValues,
	useFieldErrors,
	useFieldState,
	useFormStatus,
	useFormSubmit,
} from 'form-atoms';

import { Button, ButtonProps } from './button';
import { Icon } from './icon';

function FieldErrorIcon<TValue>(props: { atom: FieldAtom<TValue> }) {
	const { validateStatus } = useFieldState(props.atom);
	const errors = useFieldErrors(props.atom);

	if (!errors.length && validateStatus === 'valid') return null;

	return (
		<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
			{validateStatus === 'validating' && (
				<Icon.spinner className='h-5 w-5 text-red-500 animate-spin' />
			)}
			{validateStatus === 'invalid' && !!errors.length && (
				<Icon.alert aria-hidden='true' className='h-5 w-5 text-red-500' />
			)}
		</div>
	);
}

function FieldError<TValue>(props: { atom: FieldAtom<TValue> }) {
	const id = useId();
	const errors = useFieldErrors(props.atom);

	if (!errors.length) return null;

	return (
		<p className='mt-1.5 text-left text-sm text-red-500' id={`${id}-error`}>
			{errors[0]}
		</p>
	);
}

interface FormProps<TFormFields extends FormFields>
	extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	formAtom: FormAtom<TFormFields>;
	onSubmit: (values: FormFieldValues<TFormFields>) => void | Promise<void>;
	children: ReactNode;
}

function Form<T extends FormFields>(props: FormProps<T>) {
	const formSubmit = useFormSubmit(props.formAtom);

	const { submitStatus } = useFormStatus(props.formAtom);

	return (
		<form className='w-full flex flex-col' onSubmit={formSubmit(props.onSubmit)}>
			<fieldset
				className='flex flex-col space-y-4 w-full'
				disabled={submitStatus === 'submitting'}
			>
				{props.children}
			</fieldset>
		</form>
	);
}

interface SubmitButtonProps<TFormFields extends FormFields> extends ButtonProps {
	formAtom: FormAtom<TFormFields>;
}

function SubmitButton<T extends FormFields>({
	children,
	formAtom,
	...props
}: SubmitButtonProps<T>) {
	const { submitStatus } = useFormStatus(formAtom);

	return (
		<>
			<Button type='submit' loading={submitStatus === 'submitting'} {...props}>
				{children}
			</Button>
		</>
	);
}

export { Form, FieldErrorIcon, FieldError, SubmitButton };
