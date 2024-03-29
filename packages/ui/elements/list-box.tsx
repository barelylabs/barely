import React from 'react';
import { cn } from '@barely/lib/utils/cn';
import { ListBoxItem as ListBoxItemPrimitive } from 'react-aria-components';

export const ListBoxItem = React.forwardRef<
	React.ElementRef<typeof ListBoxItemPrimitive>,
	React.ComponentPropsWithoutRef<typeof ListBoxItemPrimitive>
>(({ className, ...props }, ref) => {
	return (
		<ListBoxItemPrimitive
			{...props}
			ref={ref}
			className={cn('flex flex-col outline-none data-[dragging]:opacity-50', className)}
			data-vaul-no-drag
		/>
	);
});

ListBoxItem.displayName = 'ListBoxItem';
