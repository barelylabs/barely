import type { ReactNode } from 'react';
import type { SubmitHandler, UseFormReturn } from 'react-hook-form';

import { Button } from '../elements/button';
import { Icon } from '../elements/icon';
import { H, Text } from '../elements/typography';
import { Form, SubmitButton } from '../forms';

interface SettingsCardProps {
	children: ReactNode;
	title: ReactNode;
	icon?: keyof typeof Icon;
	subtitle?: ReactNode;
	buttonLabel?: ReactNode;
	formHint?: ReactNode;
	disableSubmit?: boolean;
	onSubmit?: () => void | Promise<void>;
	isSubmitting?: boolean;
	isForm?: boolean;
}

export function SettingsCard(props: SettingsCardProps) {
	const TitleIcon = props.icon ? Icon[props.icon] : null;

	return (
		<div className='space-y-4 rounded-md border border-border'>
			<div className='flex flex-col gap-4 p-4 '>
				<div className='flex flex-row items-center gap-2'>
					{TitleIcon && <TitleIcon className='h-[25px] w-[25px]' />}
					<H size='4'>{props.title}</H>
				</div>
				<Text variant='sm/normal'>{props.subtitle}</Text>
				{props.children}
			</div>

			<div className='flex flex-row items-center justify-between gap-2 border-t border-border bg-muted p-4'>
				<Text variant='sm/normal'>{props.formHint}</Text>
				{props.isForm ?
					<SubmitButton disabled={props.disableSubmit}>
						{props.buttonLabel ?? 'Save'}
					</SubmitButton>
				:	<Button
						onClick={props.onSubmit}
						disabled={props.disableSubmit}
						loading={props.isSubmitting}
					>
						{props.buttonLabel ?? 'Save'}
					</Button>
				}
			</div>
		</div>
	);
}

export function SettingsCardForm<TFieldValues extends Record<string, unknown>>(
	props: Omit<SettingsCardProps, 'onSubmit'> & {
		form: UseFormReturn<TFieldValues>;
		onSubmit: SubmitHandler<TFieldValues>;
	},
) {
	return (
		<Form form={props.form} onSubmit={props.onSubmit}>
			<SettingsCard {...props} onSubmit={undefined} isForm>
				{props.children}
			</SettingsCard>
		</Form>
	);
}
