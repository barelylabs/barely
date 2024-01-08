import { ReactNode } from 'react';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';

import { Icon } from '../elements/icon';
import { H, Text } from '../elements/typography';
import { Form, SubmitButton } from '../forms';

export function SettingsCard<TFieldValues extends Record<string, unknown>>(props: {
	children: ReactNode;
	title: ReactNode;
	icon?: keyof typeof Icon;
	subtitle?: ReactNode;
	buttonLabel?: ReactNode;
	formHint?: ReactNode;
	disableSubmit?: boolean;
	form: UseFormReturn<TFieldValues>;
	onSubmit: SubmitHandler<TFieldValues>;
}) {
	const TitleIcon = props.icon ? Icon[props.icon] : null;

	return (
		<Form form={props.form} onSubmit={props.onSubmit}>
			<div className='space-y-4 rounded-md border border-border'>
				<div className='flex flex-col gap-4 p-4 '>
					<div className='flex flex-row items-center gap-2'>
						{TitleIcon && <TitleIcon className='h-[25px] w-[25px]' />}
						<H size='4'>{props.title}</H>
					</div>
					<Text variant='sm/normal'>{props.subtitle}</Text>
					{props.children}
				</div>

				<div className='flex flex-row items-center justify-between gap-2 border-t border-border bg-slate-50 p-4'>
					<Text variant='sm/normal'>{props.formHint}</Text>
					<SubmitButton disabled={props.disableSubmit}>
						{props.buttonLabel ?? 'Save'}
					</SubmitButton>
				</div>
			</div>
		</Form>
	);
}
