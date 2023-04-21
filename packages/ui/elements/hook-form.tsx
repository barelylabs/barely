'use client';

import { ComponentProps } from 'react';

import { ErrorMessage } from '@hookform/error-message';
import { FieldValues, FormProvider, SubmitHandler, UseFormReturn } from 'react-hook-form';

import { onPromise } from '@barely/lib/utils/edge/on-promise';

import { Icon } from './icon';

interface FieldErrorProps {
	name?: string;
}

const FieldErrorIcon = ({ name }: FieldErrorProps) => {
	if (!name) return null;

	return (
		<ErrorMessage
			name={name}
			render={({ message }) => {
				if (!message) return null;
				return (
					<div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
						<Icon.alert aria-hidden='true' className='h-5 w-5 text-red-500' />
					</div>
				);
			}}
		/>
	);
};

const FieldError = ({ name }: FieldErrorProps) => {
	if (!name) return null;

	return (
		<ErrorMessage
			name={name}
			render={({ message }) => (
				<p className='mt-2 text-left text-sm text-red-500' id={`${name ?? ''}-error`}>
					{message}
				</p>
			)}
		/>
	);
};

interface FormProps<T extends FieldValues>
	extends Omit<ComponentProps<'form'>, 'onSubmit'> {
	form: UseFormReturn<T>;
	onSubmit: SubmitHandler<T>;
}

const Form = <T extends FieldValues>({
	form,
	onSubmit,
	children,
	...props
}: FormProps<T>) => {
	const isSubmitting = form.formState.isSubmitting;

	return (
		<FormProvider {...form}>
			<form
				className='w-full flex flex-col'
				{...props}
				onSubmit={onPromise(form.handleSubmit(onSubmit))}
			>
				<fieldset className='flex flex-col space-y-4 w-full' disabled={isSubmitting}>
					{children}
				</fieldset>
				{/* {isSubmitting ? 'submitting' : 'not submitting'} */}
			</form>
		</FormProvider>
	);
};

export { Form, FieldError, FieldErrorIcon };
