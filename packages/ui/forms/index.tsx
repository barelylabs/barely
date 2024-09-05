import type * as LabelPrimitive from '@radix-ui/react-label';
import type {
	ControllerProps,
	FieldPath,
	FieldValues,
	SubmitHandler,
	UseFormReturn,
} from 'react-hook-form';
import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
import { onPromise } from '@barely/lib/utils/on-promise';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext, useFormState } from 'react-hook-form';

import type { ButtonProps } from '../elements/button';
import { Button } from '../elements/button';
import { Icon } from '../elements/icon';
import { Label } from '../elements/label';
import { LoadingSpinner } from '../elements/loading';
import { InfoTooltip } from '../elements/tooltip';

interface FormProps<T extends FieldValues>
	extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
	form: UseFormReturn<T>;
	onSubmit: SubmitHandler<T>;
	className?: string;
}

const Form = <T extends FieldValues>({
	form,
	onSubmit,
	children,
	...props
}: FormProps<T>) => {
	return (
		<FormProvider {...form}>
			<form
				{...props}
				className='w-full'
				// onSubmit={onPromise(form.handleSubmit(onSubmit))}
				onSubmit={e => {
					onPromise(form.handleSubmit(onSubmit))(e);
					e.stopPropagation();
					e.preventDefault();
					// onSubmit(form.getValues());
				}}
			>
				<fieldset
					className={cn('flex w-full max-w-full flex-col ', props.className)}
					disabled={form.formState.isSubmitting}
				>
					{children}
				</fieldset>
			</form>
		</FormProvider>
	);
};

interface FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	name: TName;
}

export const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>');
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		fieldId: `${id}-field`,
		fieldDescriptionId: `${id}-field-description`,
		fieldErrorMessageId: `${id}-field-message`,
		fieldHintId: `${id}-field-hint`,
		...fieldState,
	};
};

interface FormItemContextValue {
	id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => {
		const id = React.useId();

		return (
			<FormItemContext.Provider value={{ id }}>
				<div ref={ref} className={cn('space-y-1 text-left', className)} {...props} />
			</FormItemContext.Provider>
		);
	},
);
FormItem.displayName = 'FormItem';

export interface FieldLabelAddonProps {
	infoTooltip?: React.ReactNode;
	labelButton?: React.ReactNode;
}

export type FieldLabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
	FieldLabelAddonProps;

const FieldLabel = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	FieldLabelProps
>(({ className, infoTooltip, labelButton, ...props }, ref) => {
	const { fieldId: formItemId } = useFormField();

	return (
		<div className='flex flex-row items-center justify-between'>
			<div className='flex flex-row items-center gap-1'>
				<Label ref={ref} className={className} htmlFor={formItemId} {...props} />
				{infoTooltip && <InfoTooltip content={infoTooltip} />}
			</div>
			{labelButton && <Label asChild>{labelButton}</Label>}
		</div>
	);
});
FieldLabel.displayName = 'FieldLabel';

const FieldControl = React.forwardRef<
	React.ElementRef<typeof Slot>,
	React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
	const {
		error,
		fieldId: formItemId,
		fieldDescriptionId: formDescriptionId,
		fieldErrorMessageId: formMessageId,
	} = useFormField();

	return (
		<Slot
			ref={ref}
			id={formItemId}
			aria-describedby={
				!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	);
});
FieldControl.displayName = 'FieldControl';

const FieldDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
	const { fieldDescriptionId: formDescriptionId } = useFormField();

	return (
		<p
			ref={ref}
			id={formDescriptionId}
			className={cn('text-[0.8rem] text-muted-foreground', className)}
			{...props}
		/>
	);
});
FieldDescription.displayName = 'FieldDescription';

const FieldHint = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
	const { fieldHintId } = useFormField();

	return (
		<p
			ref={ref}
			id={fieldHintId}
			className={cn(
				'pt-1 text-[0.8rem] text-muted-foreground text-opacity-80',
				className,
			)}
			{...props}
		/>
	);
});
FieldHint.displayName = 'FieldHint';

const FieldErrorMessage = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
	const { error, fieldErrorMessageId } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body) {
		return null;
	}

	return (
		<p
			ref={ref}
			id={fieldErrorMessageId}
			className={cn('text-[0.8rem] font-medium text-destructive', className)}
			{...props}
		>
			{body}
		</p>
	);
});
FieldErrorMessage.displayName = 'FormMessage';

const FieldErrorIcon = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		isValidating?: boolean;
	}
>(({ isValidating, className, children, ...props }, ref) => {
	const { error, fieldErrorMessageId: formMessageId } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body && !isValidating) {
		return null;
	}

	return (
		<div
			ref={ref}
			id={`${formMessageId}-icon`}
			className='pointer-events-none absolute inset-y-0 right-0 flex items-center '
			{...props}
		>
			{isValidating ?
				<LoadingSpinner className={cn('mr-3')} />
			:	<Icon.alert
					aria-hidden='true'
					className={cn('h-7 w-7 pr-3 text-destructive', className)}
				/>
			}
		</div>
	);
});
FieldErrorIcon.displayName = 'FieldErrorIcon';

const SubmitButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ children, ...props }, ref) => {
		const { isSubmitting } = useFormState();

		return (
			<Button ref={ref} type='submit' loading={isSubmitting} {...props}>
				{children}
			</Button>
		);
	},
);

SubmitButton.displayName = 'SubmitButton';

export {
	useFormField,
	Form,
	FormItem,
	FieldLabel,
	FieldControl,
	FieldDescription,
	FieldHint,
	FormField,
	FieldErrorMessage,
	FieldErrorIcon,
	SubmitButton,
};
