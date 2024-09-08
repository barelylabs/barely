import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { SwitchAddonProps } from '../elements/switch';
import type { FieldProps } from './field-wrapper';
import { FieldControl, FieldLabel, FormFieldContext, FormItem } from '.';
// import { FormItem } from '../elements/form';
import { Switch } from '../elements/switch';
import { FieldMessages } from './field-wrapper';

export const SwitchField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	size = 'sm',
	infoTooltip,
	...props
}: FieldProps<TFieldValues, TName> & SwitchAddonProps) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => (
					<FormItem className='flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md'>
						<FieldLabel className='flex-grow' infoTooltip={infoTooltip}>
							{props.label}
						</FieldLabel>
						<FieldControl>
							<Switch
								{...props}
								checked={field.value}
								onCheckedChange={field.onChange}
								size={size}
							/>
						</FieldControl>
						<FieldMessages {...{ description: props.description, hint }} />
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
