import type { FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { InputProps } from '../elements/input';
import type { FieldProps } from './field-wrapper';
import { Rating } from '../elements/rating';
import { FieldMessages } from './field-wrapper';
import {
	FieldControl,
	FieldErrorIcon,
	FieldLabel,
	FormFieldContext,
	FormItem,
} from './form';

export const RatingField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	...props
}: FieldProps<TFieldValues, TName> & InputProps) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => (
					<FormItem>
						<FieldLabel>{props.label}</FieldLabel>
						<FieldControl>
							<div className='relative'>
								<Rating {...field} />
								<FieldErrorIcon />
							</div>
						</FieldControl>

						<FieldMessages {...{ description: props.description, hint, focus: true }} />
					</FormItem>
				)}
			/>
		</FormFieldContext.Provider>
	);
};
