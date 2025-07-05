// https://ui.shadcn.com/docs/primitives/alert-dialog

'use client';

import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/utils';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';

import { buttonVariants } from './button';

const AlertDialogRoot = AlertDialogPrimitive.Root;

interface AlertDialogTriggerProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>,
		VariantProps<typeof buttonVariants> {}

const AlertDialogTrigger = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
	AlertDialogTriggerProps
>(({ className, look, size, ...props }, ref) => (
	<AlertDialogPrimitive.Trigger
		className={cn(buttonVariants({ look, size }), className)}
		ref={ref}
		{...props}
	/>
));

AlertDialogTrigger.displayName = AlertDialogPrimitive.Trigger.displayName;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	// >(({ className, children, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay
		className={cn(
			'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',

			// 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in',
			className,
		)}
		{...props}
		ref={ref}
	/>
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			className={cn(
				'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',

				// 'fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-background p-6 opacity-100 animate-in fade-in-90 slide-in-from-bottom-10 sm:rounded-lg sm:zoom-in-90 sm:slide-in-from-bottom-0 md:w-full',
				className,
			)}
			{...props}
		/>
	</AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
		{...props}
	/>
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
			className,
		)}
		{...props}
	/>
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-lg font-semibold text-slate-900',
			'dark:text-slate-50',
			className,
		)}
		{...props}
	/>
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

interface AlertDialogActionProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>,
		VariantProps<typeof buttonVariants> {}

const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	AlertDialogActionProps
>(({ className, look = 'primary', size, ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(buttonVariants({ look, size }), className)}
		{...props}
	/>
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

interface AlertDialogCancelProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>,
		VariantProps<typeof buttonVariants> {}

const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	AlertDialogCancelProps
>(({ className, look = 'outline', size, ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(buttonVariants({ look, size }), className)}
		{...props}
	/>
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

//* Styled AlertDialog *//

interface AlertDialogProps {
	triggerName: React.ReactNode;
	triggerVariant?: VariantProps<typeof buttonVariants>['look'];
	triggerSize?: VariantProps<typeof buttonVariants>['size'];
	title?: React.ReactNode;
	description?: React.ReactNode;
	actionName?: React.ReactNode;
	actionVariant?: VariantProps<typeof buttonVariants>['look'];
	action: React.MouseEventHandler<HTMLButtonElement>;
	cancelName?: React.ReactNode;
	cancelVariant?: VariantProps<typeof buttonVariants>['look'];
}

const AlertDialog = (props: AlertDialogProps) => {
	return (
		<AlertDialogRoot>
			<AlertDialogTrigger
				color={props.triggerVariant ?? 'secondary'}
				size={props.triggerSize ?? 'md'}
			>
				{props.triggerName}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{props.title}</AlertDialogTitle>
					<AlertDialogDescription>{props.description}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel color={props.cancelVariant ?? 'outline'}>
						{props.cancelName ?? 'Cancel'}
					</AlertDialogCancel>
					<AlertDialogAction
						color={props.actionVariant ?? 'destructive'}
						onClick={props.action}
					>
						{props.actionName ?? 'Continue'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialogRoot>
	);
};

export {
	AlertDialog,
	AlertDialogRoot,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
};
