'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@barely/lib/utils/cn';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { Command as CommandPrimitive } from 'cmdk';

import { Command, CommandEmpty, CommandItem, CommandList } from './command';
import { LoadingDots } from './loading';

export interface ComboboxProps<T> {
	options: T[];
	getItemId: (item: T) => string;
	onItemSelect: (item: T) => void;

	placeholder?: string;
	inputOnChange?: (search: string) => void;
	displayValue: (option: T) => string;
	optImgSrc?: (option: T) => string | null | undefined;
	optImgAlt?: (option: T) => string | null | undefined;
	optTitle?: (option: T) => string | null | undefined;
	optSubtitle?: (option: T) => string | null | undefined;
	optInfo?: (option: T) => string | null | undefined;
	optDisplay?: (option: T) => React.ReactNode;
	isFetchingOptions?: boolean;
	noOptionsText?: string;
	isError?: boolean;
	shouldFilter?: boolean;
}

export const Combobox = <T extends NonNullable<unknown>>(props: ComboboxProps<T>) => {
	const {
		getItemId,
		options,
		placeholder,
		inputOnChange,
		optImgSrc,
		optImgAlt,
		optTitle,
		optSubtitle,
		optInfo,
		isFetchingOptions,
		noOptionsText,
		isError,
		shouldFilter,
		onItemSelect,
	} = props;

	const inputRef = React.useRef<HTMLInputElement>(null);
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState('');

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		const input = inputRef.current;
		if (input) {
			if (e.key === 'Escape') {
				input.blur();
			}
		}
	};

	return (
		<Command
			onKeyDown={handleKeyDown}
			shouldFilter={shouldFilter === false ? false : true}
			className='overflow-visible bg-transparent'
		>
			<div
				className={cn(
					'group rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
					isError &&
						'border-destructive focus-within:border-destructive focus-within:ring-destructive/60 ',
				)}
			>
				<div className='flex flex-wrap gap-x-2 gap-y-2'>
					<MagnifyingGlass className='my-auto mr-1 h-3.5 w-3.5 opacity-50' />

					<CommandPrimitive.Input
						ref={inputRef}
						value={inputValue}
						onValueChange={(search: string) => {
							setInputValue(search);
							inputOnChange?.(search);
						}}
						onFocus={() => setOpen(true)}
						onBlur={() => setOpen(false)}
						placeholder={placeholder ?? 'Search...'}
						className={cn(
							'flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0',
						)}
					/>
				</div>
			</div>

			{/* fixme: This is hacky, and I'm sure it's not good for focus management/accessibility. I want to do this with a popover/dialog, but couldn't figure out focus
			https://github.com/pacocoursey/cmdk/discussions/221
			*/}
			<div className={cn('relative -z-50 mt-2', open && 'z-[100]')}>
				<div
					className={cn(
						'absolute top-0 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none animate-in',
						open && 'h-fit opacity-100 animate-in fade-in-0 zoom-in-75',
						!open && 'h-0 opacity-0 animate-out fade-out-0 zoom-out-50',
					)}
				>
					<CommandList>
						{!isFetchingOptions && (
							<CommandEmpty>{noOptionsText ?? 'No results found'}</CommandEmpty>
						)}

						{options?.length > 0 &&
							options.map(opt => {
								const optId = getItemId(opt);
								const title = optTitle ? optTitle(opt) : '';
								const subtitle = optSubtitle ? optSubtitle(opt) : '';
								const info = optInfo ? optInfo(opt) : '';

								return (
									<CommandItem
										key={optId}
										value={optId}
										keywords={[title ?? '', subtitle ?? '', info ?? '']}
										onMouseDown={e => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onSelect={() => {
											setInputValue('');
											onItemSelect(opt);
										}}
										// isSelected={isSelected}
										className={'cursor-pointer'}
									>
										<div className='flex w-full justify-between'>
											<div className='flex min-h-full space-x-3'>
												{optImgSrc && (
													<Image
														src={optImgSrc(opt) ?? ''}
														alt={optImgAlt ? optImgAlt(opt) ?? '' : ''}
														width={44}
														height={44}
														className='flex-shrink-0 rounded-sm bg-subtle'
														unoptimized
													/>
												)}
												<div className='flex flex-col justify-around space-y-0.5'>
													{!!optTitle && (
														<span
															className={cn(
																'truncate text-sm text-foreground sm:text-sm',
															)}
														>
															{optTitle(opt)}
														</span>
													)}

													{!!optSubtitle && (
														<span
															className={cn('truncate text-xs text-muted-foreground')}
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
										</div>
									</CommandItem>
								);
							})}

						{/* <CommandEmpty></CommandEmpty> */}

						{isFetchingOptions && (
							<CommandEmpty>
								<LoadingDots
									className={cn('px-3 pb-3 pt-3', !!options.length && 'pt-2')}
								/>
							</CommandEmpty>
						)}
					</CommandList>
				</div>
			</div>
		</Command>
	);
};
