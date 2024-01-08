import { useState } from 'react';

import { Controller, FieldPath, FieldValues } from 'react-hook-form';

import { parseIncompletePhoneNumber } from '@barely/lib/utils/phone-number';

import { Input, InputProps } from '../elements/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../elements/select';
import { FieldMessages, FieldProps } from './field-wrapper';
import {
	FieldControl,
	FieldErrorIcon,
	FieldLabel,
	FormFieldContext,
	FormItem,
} from './index';

export const PhoneField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	...props
}: FieldProps<TFieldValues, TName> & InputProps) => {
	type CountryCode = 'US' | 'CA';
	const [countryCode, setCountryCode] = useState<CountryCode>('US');

	const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
		console.log('e.key => ', e.key);

		if (e.key === 'Backspace' && e.currentTarget.value.slice(-1) === ')') {
			return (e.currentTarget.value = e.currentTarget.value.slice(0, -1));
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget.value === '+' || e.currentTarget.value === '') return;

		const incompleteNumber = parseIncompletePhoneNumber({
			input: e.currentTarget.value,
			countryCode,
		});

		return (e.currentTarget.value = incompleteNumber);
	};

	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				render={({ field }) => {
					const [focus, setFocus] = useState(false);

					return (
						<FormItem>
							<FieldLabel>{props.label}</FieldLabel>

							<FieldControl>
								<div className='relative rounded-md'>
									<div className='absolute inset-y-0 left-0 flex items-center'>
										<label htmlFor='country' className='sr-only'>
											Country
										</label>
										<Select
											value={countryCode}
											onValueChange={value => setCountryCode(value as CountryCode)}
										>
											<SelectTrigger className='bg:transparent pr-1 border-transparent dark:border-transparent'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='US'>US</SelectItem>
												<SelectItem value='CA'>CA</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<Input
										type='tel'
										placeholder={props.placeholder}
										className='peer pl-16 '
										{...field}
										onKeyDown={e => handleInput(e)}
										onFocus={() => setFocus(true)}
										onBlur={() => setFocus(false)}
										onChange={e => {
											handleChange(e);
											field.onChange(e);
											if (props.onChange) props.onChange(e);
										}}
									/>
									<FieldErrorIcon />
								</div>
							</FieldControl>
							<FieldMessages description={props.description} hint={hint} focus={focus} />
							{/* <div>
								<FieldDescription>{props.description}</FieldDescription>
								<FieldErrorMessage />
								<FieldHint
									onFocus={() => setFocus(true)}
									onBlur={() => setFocus(false)}
									className={focus ? 'block' : 'hidden'}
								>
									{hint}
								</FieldHint>
							</div> */}
						</FormItem>
					);
				}}
			/>
		</FormFieldContext.Provider>
	);
};
