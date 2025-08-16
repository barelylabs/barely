import type { VariantProps } from 'class-variance-authority';
import { forwardRef, useMemo } from 'react';
import { cn } from '@barely/utils';
import { cva } from 'class-variance-authority';
import { debounce } from 'perfect-debounce';

import type { IconKey } from './icon';
import { Icon } from './icon';

const inputVariants = cva(
	'flex w-full max-w-full text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			variant: {
				default:
					'h-10 rounded-md border border-input bg-background px-3 py-2 focus-visible:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				contentEditable:
					'h-auto border-0 bg-transparent p-0 leading-normal hover:bg-transparent focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface InputAddonProps {
	onChangeDebounced?: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
	debounce?: number;
	isError?: boolean;
	disableController?: boolean;
	startIcon?: IconKey;
	showClearButton?: boolean;
	onClear?: () => void;
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> &
	InputAddonProps &
	VariantProps<typeof inputVariants>;

const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			type,
			onChangeDebounced,
			isError,
			autoComplete = 'off',
			showClearButton = false,
			onClear,
			startIcon,
			variant,
			...props
		},
		ref,
	) => {
		const onChangeDebouncedMemo = useMemo(() => {
			if (!onChangeDebounced) return undefined;
			return debounce(onChangeDebounced, props.debounce ?? 400);
		}, [onChangeDebounced, props.debounce]);

		const StartIcon = startIcon ? Icon[startIcon] : null;

		return (
			<div className='relative'>
				{StartIcon && (
					<div className='absolute left-0 top-0 flex h-full items-center pl-3'>
						<StartIcon className='h-[14px] w-[14px] text-accent' />
					</div>
				)}
				<input
					autoComplete={autoComplete}
					ref={ref}
					type={type}
					className={cn(
						inputVariants({ variant }),
						isError &&
							'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/60',
						startIcon && 'pl-8',
						showClearButton && 'pr-10',
						className,
					)}
					{...props}
					onChange={e => {
						props.onChange?.(e);
						if (!onChangeDebounced) return;
						onChangeDebouncedMemo?.(e).catch(err => console.error(err));
					}}
				/>
				{showClearButton &&
					typeof ref !== 'function' &&
					ref?.current &&
					typeof ref.current.value === 'string' &&
					ref.current.value.length > 0 && (
						<button
							type='button'
							onClick={() => {
								if (typeof ref === 'function' || !ref.current) return;
								ref.current.value = '';
								onClear?.();
							}}
							className='absolute right-0 top-0 h-full pr-3'
						>
							<Icon.xCircle className='h-3 w-3' />
						</button>
					)}
			</div>
		);
	},
);
Input.displayName = 'Input';

export { Input };
