import { forwardRef, useMemo } from 'react';
import { cn } from '@barely/lib/utils/cn';
import { debounce } from 'perfect-debounce';

import type { IconKey } from './icon';
import { Icon } from './icon';

export interface InputAddonProps {
	onChangeDebounced?: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
	debounce?: number;
	isError?: boolean;
	disableController?: boolean;
	startIcon?: IconKey;
	showClearButton?: boolean;
	onClear?: () => void;
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & InputAddonProps;

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
						'flex h-10 w-full max-w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
						'focus-visible:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
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
								if (typeof ref === 'function' || !ref?.current) return;
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
