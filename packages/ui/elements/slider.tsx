//

'use client';

import React, { forwardRef } from 'react';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { FieldAtom, useFieldValue } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper } from './field-wrapper';
import { TextFieldProps } from './text-field';

type SliderProps = Omit<TextFieldProps, 'children' | 'value' | 'fieldAtom'> &
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		fieldAtom: FieldAtom<number[]>;
		growThumb?: boolean;
	};

const Slider = forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
	(
		{
			fieldAtom,
			label,
			hint,
			inFocusHint,
			fullWidth,
			size,
			className,
			growThumb,
			...props
		},
		ref,
	) => {
		const vMax = props.max ?? 100;
		const value = useFieldValue(fieldAtom);

		return (
			<FieldWrapper
				fieldAtom={fieldAtom}
				name={props.name}
				{...{ size, label, hint, inFocusHint, fullWidth, className }}
			>
				<SliderPrimitive.Root
					ref={ref}
					className={cn(
						'relative flex w-full touch-none select-none items-center',
						className,
					)}
					{...props}
					value={value}
				>
					<SliderPrimitive.Track className='relative h-2 w-full grow overflow-hidden rounded-full bg-secondary '>
						<SliderPrimitive.Range className='absolute h-full bg-primary' />
					</SliderPrimitive.Track>

					{value?.map((v, i) => {
						const percentage = (v / vMax) * 100;
						return (
							<SliderPrimitive.Thumb
								key={i}
								className={cn(
									'block h-5 w-5 rounded-full border-2 border-primary bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ',
								)}
								style={{
									transform: growThumb ? `scale(${1 + (0.5 * percentage) / 100})` : '',
								}}
							></SliderPrimitive.Thumb>
						);
					})}
				</SliderPrimitive.Root>
			</FieldWrapper>
		);
	},
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
