// https://ui.shadcn.com/docs/primitives/accordion

'use client';

import * as React from 'react';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@barely/lib/utils/edge/cn';

// const AccordionPrimitive = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item ref={ref} className={cn('border-b', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className='flex '>
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn(
				'flex flex-1 items-center justify-between text-xl text-left py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
				className,
			)}
			{...props}
		>
			{children}
			<ChevronDown className='h-4 w-4 transition-transform duration-200' />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		ref={ref}
		className={cn(
			'overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up',
			className,
		)}
		{...props}
	>
		<div className='pt-0 pb-4'>{children}</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

interface AccordionItemProps {
	trigger: React.ReactNode;
	content: React.ReactNode;
	value: string;
}

interface AccordionProps {
	type?: 'single' | 'multiple';
	items: AccordionItemProps[];
}

const Accordion = (props: AccordionProps) => {
	const { items } = props;
	return (
		<AccordionPrimitive.Accordion
			type={props.type ?? 'single'}
			collapsible
			className='w-full'
		>
			{items.map(item => (
				<AccordionItem key={item.value} value={item.value}>
					<AccordionTrigger>{item.trigger}</AccordionTrigger>
					<AccordionContent>{item.content}</AccordionContent>
				</AccordionItem>
			))}
		</AccordionPrimitive.Accordion>
	);
};

export {
	Accordion,
	type AccordionItemProps,
	AccordionPrimitive,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
};
