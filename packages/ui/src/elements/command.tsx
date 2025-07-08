'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/utils';
import { cva } from 'class-variance-authority';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { Dialog, DialogContent } from './dialog';

const Command = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
	<CommandPrimitive
		ref={ref}
		className={cn(
			'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
			className,
		)}
		{...props}
	/>
));
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
	return (
		<Dialog {...props}>
			<DialogContent className='overflow-hidden p-0 shadow-lg'>
				<Command className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'>
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
};

const CommandInput = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
	<div className='flex items-center border-b px-3' data-cmdk-input-wrapper=''>
		<Search className='mr-1 h-4 w-4 shrink-0 opacity-50' />
		<CommandPrimitive.Input
			ref={ref}
			className={cn(
				'flex w-full rounded-md border-0 border-transparent bg-transparent text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-transparent focus:ring-transparent disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	</div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.List
		ref={ref}
		className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
		{...props}
	/>
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
	<CommandPrimitive.Empty ref={ref} className='py-6 text-center text-sm' {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Group
		ref={ref}
		className={cn(
			'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
			className,
		)}
		{...props}
	/>
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<CommandPrimitive.Separator
		ref={ref}
		className={cn('-mx-1 h-px bg-border', className)}
		{...props}
	/>
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
	React.ElementRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
		isSelected?: boolean;
	}
>(({ className, isSelected, ...props }, ref) => (
	<CommandPrimitive.Item
		ref={ref}
		className={cn(
			'relative flex cursor-default select-none flex-row items-center gap-2 rounded-sm border-transparent px-1.5 py-1.5 text-sm outline-none aria-selected:border-red aria-selected:bg-muted aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
			isSelected &&
				'aria-selected:border-bg-accent/50 bg-accent text-accent-foreground aria-selected:bg-accent',
			className,
		)}
		{...props}
	/>
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const commandShortcutVariants = cva(
	'hidden rounded px-2 py-0.5 text-xs font-light transition-all duration-75 group-hover:bg-gray-200 sm:inline-block',
	{
		variants: {
			variant: {
				default: '',
				button: '',
			},
			look: {
				primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
				accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
				muted: 'bg-muted text-muted-foreground hover:bg-muted/90',
			},
			// size: {
			// 	xs: 'text-xs',
			// 	sm: 'text-sm',
			// 	md: 'text-md',
			// 	lg: 'text-lg',
			// 	xl: 'text-xl',
			// },
		},
		compoundVariants: [
			{
				variant: 'default',
				look: 'primary',
				className: 'bg-primary text-primary-foreground hover:bg-primary/90',
			},
			{
				variant: 'default',
				look: 'accent',
				className: 'bg-accent text-accent-foreground hover:bg-accent/90',
			},
			{
				variant: 'default',
				look: 'muted',
				className: 'bg-muted text-muted-foreground hover:bg-muted/90',
			},
			{
				variant: 'button',
				look: 'primary',
				className: 'bg-muted-foreground text-accent hover:bg-muted-foreground/90',
			},
		],
		defaultVariants: {
			variant: 'default',
			look: 'muted',
			// size: 'md',
		},
	},
);

const CommandShortcut = ({
	className,
	variant = 'default',
	look = 'primary',
	...props
}: React.HTMLAttributes<HTMLSpanElement> &
	VariantProps<typeof commandShortcutVariants>) => {
	return (
		<kbd
			className={cn(
				// 'hidden rounded bg-slate-200 px-2 py-0.5 text-xs font-light text-gray-500 transition-all duration-75 group-hover:bg-gray-200 sm:inline-block',
				commandShortcutVariants({
					variant,
					look,
				}),
				className,
			)}
			{...props}
		/>
	);
};
CommandShortcut.displayName = 'CommandShortcut';

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
};
