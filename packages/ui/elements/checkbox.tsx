// https://ui.shadcn.com/docs/primitives/checkbox

'use client';

import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { FieldAtom, useFieldActions, useFieldValue } from 'form-atoms';
import { Check } from 'lucide-react';

import { cn } from '@barely/lib/utils/cn';

import { FieldWrapperProps } from './field-wrapper';

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			'peer h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ',
			className,
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator>
			<Check className='h-4 w-4' />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

function CheckboxField(
	props: React.ComponentProps<typeof CheckboxPrimitive.Root> &
		Omit<FieldWrapperProps<boolean>, 'children'> & { fieldAtom: FieldAtom<boolean> },
) {
	const { fieldAtom, label, ...rest } = props;
	const checked = useFieldValue(fieldAtom);

	const switchActions = useFieldActions(fieldAtom);

	return (
		<div className={cn('flex items-center justify-center ', props.className)}>
			<Checkbox
				id={rest.id}
				{...rest}
				checked={checked}
				onCheckedChange={c => switchActions.setValue(c === true ? true : false)}
			/>
			{label && (
				<label htmlFor={rest.id} className={cn('ml-2 text-sm shrink-0')}>
					{label}
				</label>
			)}
		</div>
	);
}

export { Checkbox, CheckboxField };

/* usage

import { Checkbox } from '@/components/ui/checkbox';

"use client"

import { Checkbox } from "@/components/ui/checkbox"

export function CheckboxWithText() {
  return (
    <div className="items-top flex space-x-2">
      <Checkbox id="terms1" />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms1"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}


*/
