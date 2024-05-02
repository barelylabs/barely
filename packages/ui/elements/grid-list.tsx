import type { VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';
import type {
	CheckboxProps,
	GridListItemProps,
	GridListProps as GridListPrimitiveProps,
	Selection,
} from 'react-aria-components';
import React, { useCallback, useEffect, useState } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { cva } from 'class-variance-authority';
import { Check } from 'lucide-react';
import {
	Button as AriaButton,
	Checkbox,
	GridListItem as GridListItemPrimitive,
	GridList as GridListPrimitive,
} from 'react-aria-components';

import { Button } from './button';
import { Command, CommandItem, CommandList, CommandShortcut } from './command';
import { Icon } from './icon';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface GridListProps<T extends { id: string }> extends GridListPrimitiveProps<T> {
	setSelectedKeys?: (keys: Selection) => void;
	setEditItem?: (item: T | null) => void;
	glRef?: React.Ref<HTMLDivElement> | null;
}

export function GridList<T extends { id: string }>({
	children,
	className,
	items,
	setSelectedKeys,
	setEditItem,
	onSelectionChange,
	glRef,
	...props
}: GridListProps<T & { id: string }>) {
	const handleSelectionChange = useCallback(
		(keys: Selection) => {
			if (onSelectionChange) {
				onSelectionChange(keys);
				return;
			}

			if (setSelectedKeys && setEditItem) {
				if (keys === 'all') return setSelectedKeys(keys);

				if (keys.size === 0) {
					setEditItem(null);
				}

				const selectedItem =
					Array.from(items ?? []).find(item => item.id === Array.from(keys).pop()) ??
					null;

				setEditItem(selectedItem);
			}

			setSelectedKeys?.(keys);
		},
		[setSelectedKeys, setEditItem, onSelectionChange, items],
	);

	return (
		<GridListPrimitive
			data-vaul-no-drag
			className={cn(
				'gap-2 data-[drop-target]:bg-blue-50 focus-visible:outline-none dark:data-[drop-target]:bg-slate-800',
				className,
			)}
			{...props}
			ref={glRef}
			items={items}
			onSelectionChange={handleSelectionChange}
		>
			{children}
		</GridListPrimitive>
	);
}

export const GridListItem = React.forwardRef<
	React.ElementRef<typeof GridListItemPrimitive>,
	React.ComponentPropsWithoutRef<typeof GridListItemPrimitive>
>(({ className, ...props }, ref) => (
	<GridListItemPrimitive
		ref={ref}
		{...props}
		className={cn('flex flex-col outline-none data-[dragging]:opacity-50', className)}
		data-vaul-no-drag
	/>
));

GridListItem.displayName = 'GridListItem';

export const gridListCardVariants = cva(
	'group relative flex flex-row items-center justify-between gap-4 rounded-lg border border-border bg-background p-3 pr-1 hover:cursor-default focus:border-input focus:outline-none focus-visible:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background selected:bg-muted sm:p-4',
	{
		variants: {
			size: {
				sm: 'p-2 sm:p-2',
				md: 'p-3 sm:p-4',
			},
		},
		defaultVariants: {
			size: 'md',
		},
	},
);

export interface GridListCommandItemProps {
	icon: keyof typeof Icon;
	label: ReactNode;
	shortcut?: string[];
	action: () => void;
}

interface GridListCardProps
	extends GridListItemProps,
		VariantProps<typeof gridListCardVariants> {
	setShowUpdateModal?: (show: boolean) => void;
	setShowArchiveModal?: (show: boolean) => void;
	setShowDeleteModal?: (show: boolean) => void;
	disableDragHandle?: boolean;
	disableContextMenu?: boolean;

	commandItems?: GridListCommandItemProps[];
}

export const GridListCard = React.forwardRef<
	React.ElementRef<typeof GridListItemPrimitive>,
	GridListCardProps
>(
	(
		{
			children,
			size,
			className,
			setShowArchiveModal,
			setShowDeleteModal,
			setShowUpdateModal,
			disableContextMenu,
			disableDragHandle,
			commandItems,
			...props
		},
		ref,
	) => {
		const textValue =
			props.textValue ? props.textValue
			: typeof children === 'string' ? children
			: undefined;
		const [showContextMenu, setShowContextMenu] = useState(false);

		const atLeastOnePopoverAction =
			!!commandItems?.length ||
			!!setShowUpdateModal ||
			!!setShowArchiveModal ||
			!!setShowDeleteModal;

		// handle keyboard shortcuts - close the popover if it's not currently closed
		useEffect(() => {
			const handleKeyPress = (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === 'Backspace' || event.key === 'e') {
					setShowContextMenu(false);
				}
			};
			0;
			document.addEventListener('keydown', handleKeyPress);
			return () => document.removeEventListener('keydown', handleKeyPress);
		}, []);

		return (
			<GridListItemPrimitive
				{...props}
				ref={ref}
				textValue={textValue}
				className={cn(gridListCardVariants({ size }), className)}
			>
				{({ allowsDragging }) => (
					<>
						{!disableDragHandle && allowsDragging && (
							<AriaButton slot='drag' className='py-2'>
								<Icon.grip className='h-4 w-4' />
							</AriaButton>
						)}

						<div className='flex w-full flex-row items-center justify-between'>
							<>{children}</>
							{!disableContextMenu && atLeastOnePopoverAction && (
								<Popover
									open={showContextMenu}
									onOpenChange={open => {
										setShowContextMenu(open);
									}}
								>
									<PopoverTrigger asChild>
										<Button
											variant='icon'
											look='ghost'
											className='py-2 text-slate-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-visible:opacity-100'
											size='sm'
										>
											<Icon.dotsVertical />
										</Button>
									</PopoverTrigger>

									<PopoverContent className='w-full p-2 sm:w-48' align='end'>
										<Command>
											<CommandList>
												{!!setShowUpdateModal && (
													<CommandItem
														className='justify-between'
														onSelect={() => {
															setShowContextMenu(false);
															setShowUpdateModal(true);
														}}
													>
														<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
															<Icon.edit className='h-4 w-4 ' />
															<p className='text-sm'>Open</p>
														</div>
														<CommandShortcut>enter</CommandShortcut>
													</CommandItem>
												)}

												{commandItems?.map((item, index) => {
													const CommandIcon = item.icon ? Icon[item.icon] : null;

													return (
														<CommandItem
															key={index}
															className='justify-between'
															onSelect={() => {
																setShowContextMenu(false);
																item.action();
															}}
														>
															<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
																{CommandIcon && <CommandIcon className='h-4 w-4 ' />}
																<p className='text-sm'>{item.label}</p>
															</div>
															<div className='flex flex-row items-center gap-1 text-muted-foreground'>
																{item.shortcut?.map(shortcut => (
																	<CommandShortcut key={shortcut}>
																		{shortcut}
																	</CommandShortcut>
																))}
															</div>
														</CommandItem>
													);
												})}

												{!!setShowArchiveModal && (
													<CommandItem
														className='justify-between'
														onSelect={() => {
															setShowContextMenu(false);
															setShowArchiveModal(true);
														}}
													>
														<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
															<Icon.archive className='h-4 w-4 ' />
															<p className='text-sm'>Archive</p>
														</div>
														<CommandShortcut>E</CommandShortcut>
													</CommandItem>
												)}

												{!!setShowDeleteModal && (
													<CommandItem
														className='justify-between'
														onSelect={() => {
															setShowContextMenu(false);
															setShowDeleteModal(true);
														}}
													>
														<div className='flex flex-row items-center justify-start gap-2 text-muted-foreground'>
															<Icon.trash className='h-4 w-4' />
															<p className='text-sm'>Delete</p>
														</div>
														<div className='flex flex-row items-center gap-1 text-muted-foreground'>
															<CommandShortcut className='py-0 text-md'>
																⌘
															</CommandShortcut>
															<CommandShortcut className='py-0 text-md'>
																⌫
															</CommandShortcut>
														</div>
													</CommandItem>
												)}
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
							)}
						</div>
					</>
				)}
			</GridListItemPrimitive>
		);
	},
);

GridListCard.displayName = 'GridListCard';

export function GridItemCheckbox({ children, className, ...props }: CheckboxProps) {
	return (
		<Checkbox
			{...props}
			className={cn('group flex items-center gap-2 text-lg text-current', className)}
		>
			{({ isIndeterminate, isSelected }) => (
				<>
					<div
						className={cn(
							'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border border-primary transition-all',
							'outline outline-0 outline-offset-2 outline-primary group-data-[selected]:bg-primary',
						)}
					>
						{isIndeterminate ?
							<rect x={1} y={7.5} width={15} height={3} />
						:	isSelected && (
								<Check className='h-4 w-4 text-primary-foreground group-disabled:text-gray-400 ' />
							)
						}
					</div>
					{children}
				</>
			)}
		</Checkbox>
	);
}

// export function GridItemCheckbo({ children, ...props }: CheckboxProps) {
//   return (
//     <div
//       className="flex items-center gap-2 text-lg text-[var(--text-color)] forced-color-adjust-none"
//       {...props}
//     >
//       <div
//         className={`flex h-5 w-5 items-center justify-center rounded border-2 border-[var(--border-color)] transition-all duration-200 ${
//           props["data-pressed"] ? "border-[var(--border-color-pressed)]" : ""
//         } ${props["data-focus-visible"] ? "outline outline-2 outline-offset-2 outline-[var(--focus-ring-color)]" : ""} ${
//           props["data-selected"] || props["data-indeterminate"]
//             ? "border-[var(--selected-color)] bg-[var(--selected-color)]"
//             : ""
//         }`}
//         style={{
//           borderColor:
//             props["data-selected"] || props["data-indeterminate"]
//               ? "var(--selected-color)"
//               : "var(--border-color)",
//           backgroundColor:
//             props["data-selected"] || props["data-indeterminate"]
//               ? "var(--selected-color)"
//               : "transparent",
//         }}
//       >
//         <svg
//           viewBox="0 0 18 18"
//           aria-hidden="true"
//           className="h-4 w-4"
//           style={{
//             fill: "none",
//             stroke: "var(--checkmark-color)",
//             strokeWidth: "3",
//             strokeDasharray: "22",
//             strokeDashoffset: props["data-selected"] ? "44" : "66",
//             transition: "all 200ms",
//           }}
//         >
//           {props["data-selected"] && <Check />}
//         </svg>
//       </div>
//       {children}
//     </div>
//   );
// }
