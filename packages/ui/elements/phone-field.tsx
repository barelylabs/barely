import { useState } from 'react';

import { useInputField } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';
import { parseIncompletePhoneNumber } from '@barely/lib/utils/edge/phone-number';

import { FieldWrapper } from './field-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TextFieldProps, textFieldStyles } from './text-field';

const PhoneField = ({
	fieldAtom: atom,
	label,
	hint,
	inFocusHint,
	fullWidth,
	size,
	className,
	...props
}: TextFieldProps) => {
	type CountryCode = 'US' | 'CA';
	const [countryCode, setCountryCode] = useState<CountryCode>('US');
	const field = useInputField(atom);

	const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') return;
		if (e.currentTarget.value === '+' || e.currentTarget.value === '') return;

		const incompleteNumber = parseIncompletePhoneNumber({
			input: e.currentTarget.value,
			countryCode,
		});

		return (e.currentTarget.value = incompleteNumber);
	};

	return (
		<FieldWrapper
			fieldAtom={atom}
			{...{ size, label, hint, inFocusHint, fullWidth, className }}
		>
			<div className={'relative mt-1 rounded-md'}>
				<div className='absolute inset-y-0 left-0 flex items-center'>
					<label htmlFor='country' className='sr-only'>
						Country
					</label>
					<Select
						value={countryCode}
						onValueChange={value => setCountryCode(value as CountryCode)}
					>
						<SelectTrigger className='bg:transparent dark:bg-transparent pr-1 border-transparent dark:border-transparent'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='US'>US</SelectItem>
							<SelectItem value='CA'>CA</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<input
					{...field.props}
					{...props}
					className={cn(
						textFieldStyles({
							size,

							fullWidth: fullWidth === false ? false : true,
						}),
						'pl-16',
						className,
					)}
					placeholder={props.placeholder}
					onKeyDown={e => handleInput(e)}
					// onInput={e => handleInput(e)}
				/>
			</div>
		</FieldWrapper>
	);
};

export { PhoneField };
