'use client';

import Image from 'next/image';

import { Combobox as HeadlessCombobox } from '@headlessui/react';
import { FieldAtom, useFieldValue } from 'form-atoms';
import { Atom, atom, useAtom, useAtomValue } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@barely/lib/utils/edge/cn';

import { Badge } from './badge';
import { Button } from './button';
import { Icon } from './icon';
import { Label } from './label';
import { TextFieldProps, textFieldStyles } from './text-field';

type ComboValueProps<T> =
	| {
			multi: true;
			fieldValuesAtom: FieldAtom<T[]>;
			valuesOnChange: (value: T[]) => void;
			onRemove: (value: T) => void;
			badgeDisplay: (value: T) => React.ReactNode;
			initMultiMode?: 'select' | 'display';
	  }
	| {
			multi?: false;
			fieldValueAtom: FieldAtom<T | null>;
			valueOnChange: (value: T | null) => void;
	  };

type ComboboxProps<T> = {
	placeholder?: string;
	focusOnMount?: boolean;
	inputOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	displayValue: (option: T) => string;
	optionsAtom: Atom<T[]>;
	optImgSrc?: (option: T) => string | undefined;
	optImgAlt?: (option: T) => string | undefined;
	optTitle?: (option: T) => string | undefined;
	optSubtitle?: (option: T) => string | undefined;
	optInfo?: (option: T) => string | undefined;
	optDisplay?: (option: T) => React.ReactNode;
	fetchingOptions?: boolean;
} & ComboValueProps<T>;

const multiModeAtom = atom<'select' | 'display'>('display');

export function Combobox<T>(
	props: ComboboxProps<T> & Omit<TextFieldProps, 'value' | 'fieldAtom'>,
) {
	const {
		placeholder,
		fetchingOptions,
		// options,
		optImgSrc,
		optImgAlt,
		optTitle,
		optInfo,
		optSubtitle,
		size,
		label,

		multi,
		fullWidth,
		focusOnMount,
	} = props;

	const options = useAtomValue(props.optionsAtom);

	const ComboboxOptions = (
		<HeadlessCombobox.Options className='absolute z-10 mt-3 max-h-80 w-full overflow-auto rounded-md space-y-1 bg-popover p-3 border shadow-md ring-1 ring-ring ring-opacity-5 focus:outline-none '>
			{!options.length && fetchingOptions && <p className='text-sm'>Loading...</p>}
			{!options.length && !fetchingOptions && <p className='text-sm'>No options found</p>}
			{!!options.length &&
				options.map((opt, index) => (
					<HeadlessCombobox.Option
						key={`track.${index}`}
						value={opt}
						className={({ active, selected }) =>
							cn(
								'relative cursor-default select-none py-2 px-3 rounded-md',
								selected
									? 'dark:bg-purple-500 text-gray-900'
									: active
									? 'bg-slate-600 text-white'
									: '',
							)
						}
					>
						{({ active, selected }) => (
							<div className='flex  justify-between w-full'>
								<div className='flex  space-x-3 min-h-full '>
									{optImgSrc && (
										<Image
											src={optImgSrc(opt) ?? ''}
											alt={optImgAlt ? optImgAlt(opt) ?? '' : ''}
											width={44}
											height={44}
											className='flex-shrink-0 rounded-sm bg-slate-100 dark:bg-slate-900'
											unoptimized
										/>
									)}
									<div className='flex flex-col justify-around space-y-0.5'>
										{!!optTitle && (
											<span
												className={cn(
													'text-base sm:text-sm truncate text-gray-800 dark:text-white',
													(active || selected) && 'text-white dark:text-50',
												)}
											>
												{optTitle(opt)}
											</span>
										)}

										{!!optSubtitle && (
											<span
												className={cn(
													'text-xs sm:text-xs truncate text-gray-500 dark:text-gray-300',
													(active || selected) && 'text-white',
												)}
											>
												{optSubtitle(opt)}
											</span>
										)}
									</div>
								</div>
								{optInfo && (
									<span className='text-sm text-gray-300 dark:text-slate-400'>
										{optInfo(opt)}
									</span>
								)}
								{selected && <Check className='text-white dark:text-slate-800' />}
							</div>
						)}
					</HeadlessCombobox.Option>
				))}
		</HeadlessCombobox.Options>
	);

	useHydrateAtoms(new Map([[multiModeAtom, (multi && props.initMultiMode) ?? 'select']]));
	const [multiMode, setMultiMode] = useAtom(multiModeAtom);

	const value = !multi ? useFieldValue(props.fieldValueAtom) : null;
	const multiValues = multi ? useFieldValue(props.fieldValuesAtom) : [];

	return (
		<div className='w-full'>
			<Label size={size}>{label}</Label>

			{multi && multiMode === 'display' ? (
				<div className='flex flex-row flex-wrap gap-2 py-2 w-full items-center'>
					{multiValues.map((v, index) => (
						<Badge key={`${props.name ?? ''}.selected.${index}`} variant='subtle'>
							{props.badgeDisplay(v)}
						</Badge>
					))}
					<Button onClick={() => setMultiMode('select')} variant='ghost' icon pill>
						<Icon.edit className='w-3 h-3 dark:text-slate-300' />
					</Button>
				</div>
			) : multi && multiMode === 'select' ? (
				<HeadlessCombobox multiple value={multiValues} onChange={props.valuesOnChange}>
					<div className='w-full relative'>
						<div className='flex items-center '>
							<div
								className={cn(
									textFieldStyles({
										size,

										fullWidth,
									}),
									'h-full focus-within:outline-none focus-within:border-neutral-300 focus-within:ring-2 focus-within:ring-slate-400 focus-within:ring-offset-2 dark:focus-within:ring-slate-400 dark:focus-within:ring-offset-slate-900',
									multiValues.length > 0 && 'pl-2 pr-6',
								)}
							>
								<div className='flex flex-row flex-wrap gap-2 py-2 w-full'>
									{multiValues.map((v, index) => (
										<Badge
											key={`${props.name ?? ''}.selected.${index}`}
											variant='subtle'
											removeButton
											onRemove={() => props.onRemove(v)}
										>
											{props.badgeDisplay(v)}
										</Badge>
									))}
									<HeadlessCombobox.Input
										onChange={props.inputOnChange}
										displayValue={props.displayValue ?? ''}
										placeholder={multiValues.length === 0 ? placeholder : ''}
										className={cn(
											'bg-transparent p-0 border-transparent text-sm flex-grow focus:outline-none dark:focus:outline-none focus:border-transparent dark:focus:border-transparent focus:ring-transparent dark:focus:ring-transparent',
										)}
										onKeyDownCapture={(e: React.KeyboardEvent<HTMLInputElement>) => {
											const lastValue = multiValues[multiValues.length - 1];
											if (e.key === 'Backspace' && !e.currentTarget.value && lastValue) {
												props.onRemove(lastValue);
											}
											if (e.key === 'Enter') {
												e.currentTarget.value = '';
											}
										}}
									/>
								</div>
							</div>
							<HeadlessCombobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
								<ChevronsUpDown className='h-4 w-4 text-gray-400' aria-hidden='true' />
							</HeadlessCombobox.Button>
						</div>
						{ComboboxOptions}
					</div>
				</HeadlessCombobox>
			) : (
				!multi && (
					<HeadlessCombobox value={value} onChange={props.valueOnChange}>
						<div className='w-full relative'>
							<div className='flex items-center '>
								<HeadlessCombobox.Input
									autoFocus={focusOnMount}
									className={textFieldStyles({
										size,

										fullWidth,
									})}
									onChange={props.inputOnChange}
									displayValue={props.displayValue ?? ''}
									placeholder={placeholder}
								/>
								<HeadlessCombobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
									<ChevronsUpDown className='h-4 w-4 text-gray-400' aria-hidden='true' />
								</HeadlessCombobox.Button>
							</div>
							{ComboboxOptions}
						</div>
					</HeadlessCombobox>
				)
			)}
		</div>
	);
}
