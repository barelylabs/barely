import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { FieldProps } from './field-wrapper';
import { Toggle } from '../elements/toggle';
import { FieldMessages } from './field-wrapper';
import { FieldControl, FormFieldContext, FormItem } from './index';

type ToggleFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = FieldProps<TFieldValues, TName> & {
	children?: React.ReactNode;
};

export const ToggleField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues> & {
		children?: React.ReactNode;
	},
>({
	hint,
	children,
	...props
}: ToggleFieldProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => (
					<FormItem>
						<FieldControl>
							<Toggle pressed={field.value} onPressedChange={field.onChange}>
								{children}
							</Toggle>
						</FieldControl>
						<FieldMessages {...{ description: props.description, hint }} />
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
