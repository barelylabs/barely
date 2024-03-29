'use client';

import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
// import { FieldAtom, useFieldActions, useFieldValue } from 'form-atoms';
import { Circle } from 'lucide-react';

// import { FieldWrapperProps } from './field-wrapper';

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
	return (
		<RadioGroupPrimitive.Root
			className={cn('grid gap-2', className)}
			{...props}
			ref={ref}
		/>
	);
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
	// >(({ className, children, ...props }, ref) => {
	return (
		<RadioGroupPrimitive.Item
			ref={ref}
			className={cn(
				'h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
				<Circle className='h-2.5 w-2.5 fill-slate-900 dark:fill-slate-50' />
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// function RadioGroupField(
// 	props: React.ComponentProps<typeof RadioGroupPrimitive.Root> &
// 		Omit<FieldWrapperProps<string>, 'children'> & { fieldAtom: FieldAtom<string> },
// ) {
// 	const { fieldAtom, label, ...rest } = props;
// 	const value = useFieldValue(fieldAtom);

// 	const switchActions = useFieldActions(fieldAtom);

// 	return (
// 		<div className={cn('flex items-center justify-center ', props.className)}>
// 			<RadioGroup
// 				id={rest.id}
// 				{...rest}
// 				value={value}
// 				onValueChange={c => switchActions.setValue(c)}
// 			/>
// 			{label && (
// 				<label htmlFor={rest.id} className={cn('ml-2 text-sm')}>
// 					{label}
// 				</label>
// 			)}
// 		</div>
// 	);
// }

export { RadioGroup, RadioGroupItem };

/* usage 

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>

*/
