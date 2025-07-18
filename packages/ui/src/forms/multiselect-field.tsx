import type { Optional } from '@barely/utils';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { MultiSelectProps } from '../elements/multiselect';
import type { FieldProps } from './field-wrapper';
import { MultiSelect } from '../elements/multiselect';
import { FieldWrapper } from './field-wrapper';
import { FieldControl, FormFieldContext, FormItem } from './form';

export const MultiSelectField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: FieldProps<TFieldValues, TName> &
	Optional<
		Omit<MultiSelectProps<TFieldValues[TName][number]>, 'values'>,
		'onValuesChange'
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
									<MultiSelect<TFieldValues[TName][number]>
										{...props}
										values={field.value}
										onValuesChange={v => {
											field.onChange(v);
											props.onValuesChange?.(v);
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
