import { cn } from '@barely/utils';

interface TextInputProps {
	id?: string;
	name?: string;
	type?: 'text' | 'email' | 'password';

	label?: string;
	placeholder?: string;

	labelOverlap?: boolean;
	labelClassName?: string;

	inputClassName?: string;

	size?: 'sm' | 'md' | 'lg';
}

export default function TextInput(
	props: TextInputProps & React.InputHTMLAttributes<HTMLInputElement>,
) {
	const labelOverlap =
		'absolute inline-block -top-2 left-2 -mt-px px-1 text-xs text-gray-900';

	return (
		<div className='relative rounded-md border border-gray-300 px-3 py-2 shadow-sm focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600'>
			<label
				htmlFor={props.name}
				className={cn(
					'block bg-white text-sm font-medium text-gray-700',
					props.labelOverlap ? labelOverlap : '',
					props.labelClassName,
				)}
			>
				{props.label}
			</label>
			<input
				type={props.type ?? 'text'}
				name={props.name}
				id={props.name}
				className='block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm'
				placeholder={props.placeholder}
			/>
		</div>
	);
}
