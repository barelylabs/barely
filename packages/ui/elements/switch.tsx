// https://ui.shadcn.com/docs/primitives/switch

'use client';

import * as React from 'react';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import { FieldAtom, useFieldActions, useFieldValue } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper, FieldWrapperProps } from './field-wrapper';

const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
			className,
		)}
		{...props}
		ref={ref}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5',
			)}
		/>
	</SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

function SwitchField(
	props: React.ComponentProps<typeof SwitchPrimitives.Root> &
		Omit<FieldWrapperProps<boolean>, 'children'> & { fieldAtom: FieldAtom<boolean> },
) {
	const { fieldAtom, ...rest } = props;
	const checked = useFieldValue(fieldAtom);
	const switchActions = useFieldActions(fieldAtom);

	return (
		<FieldWrapper fieldAtom={fieldAtom} {...rest}>
			<Switch
				{...rest}
				checked={checked}
				onCheckedChange={c => switchActions.setValue(c)}
			/>
		</FieldWrapper>
	);
}

export { Switch, SwitchField };

/* usage

import { Switch } from "@/components/ui/switch"

<Switch />

*/
