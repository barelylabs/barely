import type { ReactNode } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@barely/utils';

import type { FieldLabelAddonProps } from './form';
import { Icon } from '../elements/icon';
import { FieldDescription, FieldErrorMessage, FieldHint, FieldLabel } from './form';

export interface FieldMessagesProps {
	description?: ReactNode;
	hint?: ReactNode;
	focus?: boolean;
}

export type FieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<ControllerProps<TFieldValues, TName>, 'render'> & {
	label?: ReactNode;
	labelClassName?: string;
	disabled?: boolean;
	allowEnable?: boolean;
	allowEnableConfirmMessage?: string;
} & FieldLabelAddonProps &
	FieldMessagesProps;

export function FieldMessages(props: FieldMessagesProps) {
	return (
		<>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			{props.hint && (
				<FieldHint className={props.focus ? 'block' : 'hidden'}>{props.hint}</FieldHint>
			)}
			<FieldErrorMessage />
		</>
	);
}

export function FieldWrapper({
	label,
	labelClassName,
	labelButton,
	infoTooltip,
	isDisabled,
	toggleDisabled,
	...props
}: {
	children: ReactNode;
	label?: ReactNode;
	labelClassName?: string;
	labelButton?: ReactNode;
	isDisabled?: boolean;
	toggleDisabled?: () => void;
} & FieldLabelAddonProps &
	FieldMessagesProps) {
	const _labelButton =
		labelButton ??
		(isDisabled && toggleDisabled && (
			<button
				type='button'
				onClick={toggleDisabled}
				className='flex flex-row items-center gap-1'
			>
				<Icon.lock className='h-[11px] w-[11px]' />
				Unlock
			</button>
		));

	return (
		<>
			{label && (
				<FieldLabel
					className={cn('w-full', labelClassName)}
					infoTooltip={infoTooltip}
					labelButton={_labelButton}
				>
					{label}
				</FieldLabel>
			)}

			{props.children}
			<FieldMessages {...props} />
		</>
	);
}
