import { Optional } from '@barely/lib/utils/types';
import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { MultiSelect, MultiSelectProps } from '../elements/multiselect';
import { FieldProps, FieldWrapper } from './field-wrapper';
import { FieldControl, FormFieldContext, FormItem } from './index';

export const MultiSelectField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: FieldProps<TFieldValues, TName> &
	Optional<
		Omit<MultiSelectProps<TFieldValues[TName][number]>, 'values'>,
		'valuesOnChange'
	>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field, fieldState }) => {
					return (
						<FormItem>
							<FieldWrapper {...{ ...props }}>
								<FieldControl>
									<MultiSelect
										{...props}
										values={field.value}
										valuesOnChange={v => {
											field.onChange(v);
											props.valuesOnChange?.(v);
										}}
										isError={fieldState.invalid}
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
