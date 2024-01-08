'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@barely/lib/utils/cn';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Command as CommandPrimitive } from 'cmdk';
import { Check } from 'lucide-react';
import { debounce } from 'perfect-debounce';

import { Badge } from './badge';
import { Command, CommandEmpty, CommandItem, CommandList } from './command';
import { LoadingDots } from './loading';

export type MultiSelectProps<T> = {
	getItemId: (item: T) => string;
	options: T[];
	values: T[];
	valuesOnChange: (values: T[]) => void;
	valuesOnChangeDebounced?: (values: T[]) => void;
	debounce?: number;
	hideOnValueSelect?: boolean;
	initMode?: 'select' | 'display';
	placeholder?: string;
	focusOnMount?: boolean;
	inputOnChange?: (search: string) => void;
	displayValue: (option: T) => string;
	optImgSrc?: (option: T) => string | undefined;
	optImgAlt?: (option: T) => string | undefined;
	optTitle?: (option: T) => string | undefined;
	optSubtitle?: (option: T) => string | undefined;
	optInfo?: (option: T) => string | undefined;
	optDisplay?: (option: T) => React.ReactNode;
	isFetchingOptions?: boolean;
	noOptionsText?: string;
	isError?: boolean;
	showSelectedOptions?: boolean;
	shouldFilter?: boolean;
	displayMode?: 'select' | 'display';
};

export const MultiSelect = <T extends NonNullable<unknown>>(
	props: MultiSelectProps<T>,
) => {
	const debouncedOnValuesChangedMemo = React.useMemo(() => {
		return props.valuesOnChangeDebounced
			? debounce(props.valuesOnChangeDebounced, props.debounce ?? 500)
			: undefined;
	}, [props.valuesOnChangeDebounced, props.debounce]);

	const handleDebouncedChange = React.useCallback((values: T[]) => {
		debouncedOnValuesChangedMemo?.(values).catch(err => console.error(err));
	}, []);

	const handleValuesChanged = (values: T[]) => {
		props.valuesOnChange(values);
		handleDebouncedChange(values);
	};

	const inputRef = React.useRef<HTMLInputElement>(null);
	const [inputFocused, setInputFocused] = React.useState(false);

	React.useEffect(() => {
		console.log('inputFocused => ', inputFocused);
		if (inputFocused)
			setTimeout(() => {
				inputRef.current?.focus();
			}, 1);
	}, [inputFocused]);

	const [open, setOpen] = React.useState(false);

	const [inputValue, setInputValue] = React.useState('');

	function getItemId(item: T) {
		if (props.getItemId) {
			return props.getItemId(item);
		} else if ('id' in item && typeof item.id === 'string') {
			return item.id;
		} else {
			throw new Error('Item has neither an id nor a getItemId function');
		}
	}

	const handleUnselect = React.useCallback(
		(item: T) => {
			const updatedValues = props.values.filter(s => getItemId(s) !== getItemId(item));
			handleValuesChanged?.(updatedValues);
		},
		[props.values],
	);

	const handleToggleSelect = React.useCallback(
		(item: T) => {
			if (props.values.map(s => getItemId(s)).includes(getItemId(item))) {
				handleUnselect(item);
			} else {
				handleValuesChanged?.([...props.values, item]);
			}
		},
		[props.values],
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (input) {
				if ((e.key === 'Delete' || e.key === 'Backspace') && input.value === '') {
					console.log(props.values);
					const lastValue = props.values[props.values.length - 1];
					!!lastValue && handleUnselect(lastValue);
				}

				if (e.key === 'Escape') {
					input.blur();
				}
			}
		},
		[props.values],
	);

	const selectableOptions = props.showSelectedOptions
		? props.options
		: props.options.filter(
				item => !props.values.map(s => getItemId(s)).includes(getItemId(item)),
		  );

	if (props.hideOnValueSelect && props.values.length > 0) return null;

	if (props.displayMode === 'display')
		return (
			<div className='flex w-full flex-row flex-wrap  items-center gap-2'>
				{props.values.map((v, index) => (
					<Badge key={`${getItemId(v)}.selected.${index}`} variant='subtle' size='sm'>
						{props.displayValue(v)}
					</Badge>
				))}
			</div>
		);

	return (
		<Command
			onKeyDown={handleKeyDown}
			shouldFilter={props.shouldFilter === false ? false : true}
			className='overflow-visible bg-transparent'
		>
			<div
				className={cn(
					'group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
					props.isError &&
						'border-destructive focus-within:border-destructive focus-within:ring-destructive/60 ',
					props.values.length > 0 && 'px-2.5 py-2.5',
				)}
			>
				<div className='flex flex-wrap gap-x-2 gap-y-2'>
					{props.values.length === 0 && (
						<MagnifyingGlass className='my-auto mr-1 h-3.5 w-3.5 opacity-50' />
					)}

					{props.values.map(item => {
						return (
							<Badge
								key={getItemId(item)}
								variant='subtle'
								size='sm'
								rectangle
								removeButton
								onRemove={() => {
									handleUnselect(item);
									// fixme: found this hack to fix the focus issue, but it's not ideal. Couldn't get their useEffect solution to work
									// https://stackoverflow.com/questions/62839139/react-useref-forwardref-not-working-as-expected-when-focusing-a-radio-button
									setTimeout(() => {
										open && inputRef.current?.focus();
									}, 1);
								}}
							>
								{props.displayValue(item)}
							</Badge>
						);
					})}

					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={(search: string) => {
							setInputValue(search);
							props.inputOnChange?.(search);
						}}
						onBlur={() => {
							setOpen(false);
							setInputFocused(false);
						}}
						onFocus={() => setOpen(true)}
						placeholder={props.placeholder ?? 'Search...'}
						className={cn(
							'flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0',
						)}
					/>
				</div>
			</div>

			<div className='relative mt-2 '>
				{open && (!!inputValue.length || !!props.options.length) && (
					<div className='absolute top-0 z-10 h-fit w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in'>
						<CommandList>
							{!props.isFetchingOptions && (
								<CommandEmpty>{props.noOptionsText ?? 'No results found'}</CommandEmpty>
							)}

							{selectableOptions.map(opt => {
								const optId = getItemId(opt);

								const isSelected = props.values.map(s => getItemId(s)).includes(optId);

								return (
									<CommandItem
										key={optId}
										value={optId}
										onMouseDown={e => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onSelect={() => {
											setInputValue('');
											handleToggleSelect(opt);
										}}
										isSelected={isSelected}
										className={'cursor-pointer'}
									>
										<div className='flex w-full justify-between'>
											<div className='flex min-h-full space-x-3 '>
												{props.optImgSrc && (
													<Image
														src={props.optImgSrc(opt) ?? ''}
														alt={props.optImgAlt ? props.optImgAlt(opt) ?? '' : ''}
														width={44}
														height={44}
														className='flex-shrink-0 rounded-sm bg-subtle'
														unoptimized
													/>
												)}
												<div className='flex flex-col justify-around space-y-0.5'>
													{!!props.optTitle && (
														<span
															className={cn(
																'truncate text-sm text-foreground sm:text-sm',
																// (active || selected) && 'text-white dark:text-50',
															)}
														>
															{props.optTitle(opt)}
														</span>
													)}

													{!!props.optSubtitle && (
														<span
															className={cn(
																'truncate text-xs text-muted-foreground',
																// (active || selected) && 'text-white',
															)}
														>
															{props.optSubtitle(opt)}
														</span>
													)}
												</div>
											</div>

											{props.optInfo && (
												<span className='text-sm text-gray-300 dark:text-slate-400'>
													{props.optInfo(opt)}
												</span>
											)}

											{isSelected && (
												<Check className='my-auto h-4 w-4 text-muted-foreground ' />
											)}
										</div>
									</CommandItem>
								);
							})}

							{props.isFetchingOptions && (
								<LoadingDots
									className={cn('px-3 pb-3 pt-3', !!selectableOptions.length && 'pt-2')}
								/>
							)}
						</CommandList>
					</div>
				)}
			</div>
		</Command>
	);
};
