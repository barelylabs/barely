import { cn } from '@barely/utils/edge';
import { cva, VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';

const floatingLabelStyles =
	'absolute z-10 origin-[0]  scale-75 transform text-gray-500 duration-300 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500 ';

const formLabelStyles = cva('block font-medium text-gray-700', {
	variants: {
		size: {
			sm: 'text-sm',
			md: 'text-md',
			lg: 'text-lg',
		},
		position: {
			top: '',
			overlap: floatingLabelStyles + 'top-2 left-1 mx-1 bg-white px-1',
			inside: floatingLabelStyles,
		},
	},

	compoundVariants: [
		// top
		{ size: 'sm', position: 'top', className: 'py-1' },
		{ size: 'md', position: 'top', className: 'py-1' },
		{ size: 'lg', position: 'top', className: 'py-1' },

		// overlap
		{
			size: 'sm',
			position: 'overlap',
			className:
				'-translate-y-[17px] px-2 peer-focus:px-2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-[17px] peer-placeholder-shown:-translate-y-1/2 ',
		},
		{
			size: 'md',
			position: 'overlap',
			className:
				'-translate-y-[17px] px-2 peer-focus:px-2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-[17px] peer-placeholder-shown:-translate-y-1/2 ',
		},
		{
			size: 'lg',
			position: 'overlap',
			className:
				'-translate-y-[21px] px-2 peer-focus:px-2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-[21px] peer-placeholder-shown:-translate-y-1/2 ',
		},

		// inside
		{
			size: 'sm',
			position: 'inside',
			className:
				'-translate-y-3 peer-placeholder-shown:translate-y-0 top-3 left-3 peer-focus:-translate-y-3',
		},
		{
			size: 'md',
			position: 'inside',
			className:
				'-translate-y-3.5 peer-placeholder-shown:translate-y-0 top-3.5 left-3 peer-focus:-translate-y-3.5',
		},
		{
			size: 'lg',
			position: 'inside',
			className:
				'-translate-y-4 peer-placeholder-shown:translate-y-0 top-4 left-4 peer-focus:-translate-y-4',
		},
	],
	defaultVariants: {
		size: 'md',
		position: 'top',
	},
});

export type FormLabelStylesProps = VariantProps<typeof formLabelStyles>;

export interface FormLabelProps extends VariantProps<typeof formLabelStyles> {
	htmlFor?: string;
	className?: string;
	children: ReactNode;
}

export const FormLabel = ({ position, size, className, ...props }: FormLabelProps) => {
	return (
		<label
			htmlFor={props.htmlFor}
			className={cn(formLabelStyles({ position, size }), className)}
			{...props}
		>
			{props.children}
		</label>
	);
};
