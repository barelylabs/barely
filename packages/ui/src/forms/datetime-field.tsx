import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { DateTimePickerProps } from '../elements/datetime-picker';
import type { FieldProps } from './field-wrapper';
import { DateTimePicker } from '../elements/datetime-picker';
import { FieldWrapper } from './field-wrapper';
import { FieldControl, FormFieldContext, FormItem } from './form';

export const DatetimeField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: FieldProps<TFieldValues, TName> & DateTimePickerProps) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => {
					return (
						<FormItem>
							<FieldWrapper {...props}>
								<FieldControl>
									<DateTimePicker
										{...props}
										jsDate={field.value}
										onJsDateChange={v => {
											field.onChange(v);
											props.onJsDateChange?.(v);
										}}
									/>
								</FieldControl>
							</FieldWrapper>
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};
