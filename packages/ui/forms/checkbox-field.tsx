import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { CheckboxProps } from '../elements/checkbox';
import type { FieldProps } from './field-wrapper';
import { Checkbox } from '../elements/checkbox';
import { FieldMessages } from './field-wrapper';
import { FieldControl, FieldLabel, FormFieldContext, FormItem } from './index';

export const CheckboxField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: FieldProps<TFieldValues, TName> & CheckboxProps) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => (
					<FormItem className='flex flex-row items-center gap-2'>
						<FieldControl>
							<Checkbox
								{...field}
								{...props}
								checked={field.value}
								onCheckedChange={c => {
									field.onChange(c);
									props.onCheckedChange?.(c);
								}}
							/>
						</FieldControl>
						<div className='space-y-1 pb-[2px] leading-none'>
							<FieldLabel>{props.label}</FieldLabel>
							<FieldMessages {...{ description: props.description, hint: props.hint }} />
						</div>
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
