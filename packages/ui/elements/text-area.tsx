import * as React from 'react';
import { cn } from '@barely/lib/utils/cn';

import { InputAddonProps } from './input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
	InputAddonProps;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, isError, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
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
