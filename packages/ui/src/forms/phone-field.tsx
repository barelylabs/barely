import type { CountryCode } from '@barely/validators/helpers';
import type { FieldPath, FieldValues } from 'react-hook-form';
import { useState } from 'react';
import { cn } from '@barely/utils';
import { parseIncompletePhoneNumber } from '@barely/validators/helpers';
import { Controller } from 'react-hook-form';

import type { InputProps } from '../elements/input';
import type { FieldProps } from './field-wrapper';
import { Input } from '../elements/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../elements/select';
import { FieldMessages } from './field-wrapper';
import {
	FieldControl,
	FieldErrorIcon,
	FieldLabel,
	FormFieldContext,
	FormItem,
} from './form';

// Country-specific phone number placeholders
const PHONE_PLACEHOLDERS: Record<CountryCode, string> = {
	US: '+1 (555) 123-4567',
	CA: '+1 (416) 123-4567',
	GB: '+44 20 1234 5678',
	// Add more countries as needed
};

export const PhoneField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	hint,
	selectTriggerClassName,
	...props
}: FieldProps<TFieldValues, TName> &
	InputProps & { selectTriggerClassName?: string }) => {
	const [countryCode, setCountryCode] = useState<CountryCode>('US');

	const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
		console.log('e.key => ', e.key);

		if (e.key === 'Backspace' && e.currentTarget.value.endsWith(')')) {
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
	const [focus, setFocus] = useState(false);
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller
				{...props}
				disabled={props.disableController}
				render={({ field }) => {
					return (
						<FormItem>
							<FieldLabel>{props.label}</FieldLabel>

							<FieldControl>
								<div className='relative rounded-md'>
									<div className='absolute inset-y-0 left-0 z-10 flex items-center'>
										<label htmlFor='country' className='sr-only'>
											Country
										</label>
										<Select
											value={countryCode}
											onValueChange={value => setCountryCode(value as CountryCode)}
											disabled={props.disabled}
										>
											<SelectTrigger
												className={cn(
													'border-transparent bg-transparent pr-1 dark:border-transparent',
													selectTriggerClassName,
												)}
											>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='US'>US</SelectItem>
												<SelectItem value='CA'>CA</SelectItem>
												<SelectItem value='GB'>UK</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<Input
										type='tel'
										placeholder={props.placeholder ?? PHONE_PLACEHOLDERS[countryCode]}
										className='peer pl-16'
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
