import { ButtonOrLink, Props as ButtonOrLinkProps } from './button-or-link';

const Link = (props: ButtonOrLinkProps) => {
	return (
		<ButtonOrLink
			className='font-medium text-gray-900 underline hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:text-gray-100'
			{...props}
		/>
	);
};

export { Link };
