import type { ReactNode } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import type { FieldLabelAddonProps } from '.';
import { FieldDescription, FieldErrorMessage, FieldHint, FieldLabel } from '.';
import { Icon } from '../elements/icon';

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
	labelButton,
	infoTooltip,
	isDisabled,
	toggleDisabled,
	...props
}: {
	children: ReactNode;
	label?: ReactNode;
	labelButton?: ReactNode;
	isDisabled?: boolean;
	toggleDisabled?: () => void;
} & FieldLabelAddonProps &
	FieldMessagesProps) {
	const _labelButton = labelButton ? (
		labelButton
	) : isDisabled && toggleDisabled ? (
		<button
			type='button'
			onClick={toggleDisabled}
			className='flex flex-row items-center gap-1'
		>
			<Icon.lock className='h-[11px] w-[11px]' />
			Unlock
		</button>
	) : null;

	return (
		<>
			{label && (
				<FieldLabel
					className='w-full'
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
