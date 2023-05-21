import * as React from 'react';

import { cn } from '@barely/lib/utils/edge/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				className={cn(
					'flex h-20 w-full rounded-md border bg-transparent py-2 px-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ',
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
