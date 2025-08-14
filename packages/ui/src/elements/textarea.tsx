import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@barely/utils';
import { cva } from 'class-variance-authority';

import type { InputAddonProps } from './input';

const textareaVariants = cva(
	'flex w-full max-w-full text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'min-h-[80px] rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				contentEditable:
					'min-h-0 resize-none border-0 bg-transparent p-0 leading-normal hover:bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	InputAddonProps &
	VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, isError, variant, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					textareaVariants({ variant }),
					isError &&
						'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/60',
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Textarea.displayName = 'Textarea';

export { Textarea };

/* usage 

import { Textarea } from "@/components/ui/textarea"
 
export function TextareaDemo() {
  return <Textarea placeholder="Type your message here." />
}

*/
