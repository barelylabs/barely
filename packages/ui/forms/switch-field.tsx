import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { FieldControl, FieldLabel, FormFieldContext } from '.';
import { FormItem } from '../elements/form';
import { Switch, SwitchAddonProps } from '../elements/switch';
import { FieldMessages, FieldProps } from './field-wrapper';

export const SwitchField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
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
								checked={field.value}
								onCheckedChange={field.onChange}
								size='sm'
								{...props}
							/>
						</FieldControl>
						<FieldMessages {...{ description: props.description, hint }} />
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
