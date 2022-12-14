import { HTMLAttributes, ReactNode } from 'react';

import { Icon } from './Icon';
import { Style, StyleProps } from '@barely/class';

class ButtonStyles extends Style {
	base = 'flex font-semibold justify-middle';

	solid = 'shadow-md'; //'bg-primary text-primary hover:bg-purple-500';
	outline = 'shadow-md';
	ghost = '';
	link = 'hover:underline';

	// colors
	primary = '';
	secondary = '';
	confirm = '';
	danger = '';

	// interactions
	depress = 'active:scale-[99%] active:translate-y-[1px]';

	// size
	sm = 'px-6 py-3 mb-3 text-sm';
	md = 'px-6 py-3 mb-3 text-base';
	lg = 'px-6 py-3 mb-3 text-lg';
	full = 'w-full';

	// rounded corners
	rounded = 'rounded-xl';
	round = 'rounded-2xl';
	pill = 'rounded-full';

	//
	icon = '';

	// apps
	instagram = '';
	spotify = '';
	twitter = '';
	tiktok = '';
	youtube = '';

	compounds = [
		// solid
		{
			states: ['solid', 'primary'],
			classes: 'bg-primary text-light hover:bg-primary-hover',
		},
		{
			states: ['solid', 'secondary'],
			classes: 'bg-secondary text-light hover:bg-secondary-hover',
		},
		{ states: ['solid', 'confirm'], classes: 'bg-confirm text-light hover:bg-confirm-hover' },
		{ states: ['solid', 'danger'], classes: 'bg-danger text-light hover:bg-danger-hover' },
		{
			states: ['solid', 'spotify'],
			classes: 'bg-spotify-500 text-light hover:bg-spotify-600',
		},
		{
			states: ['solid', 'instagram'],
			classes: 'bg-instagram-500 text-light hover:bg-instagram-600',
		},
		{
			states: ['solid', 'twitter'],
			classes: 'bg-twitter-500 text-light hover:bg-twitter-600',
		},
		{
			states: ['solid', 'tiktok'],
			classes: 'bg-tiktok-500 text-light hover:bg-tiktok-600',
		},
		// ghost
		{ states: ['ghost', 'instagram'], classes: 'text-primary hover:text-instagram-500' },
		{ states: ['ghost', 'spotify'], classes: 'text-primary hover:text-spotify-500' },
		{ states: ['ghost', 'twitter'], classes: 'text-primary hover:text-twitter-500' },
		{ states: ['ghost', 'tiktok'], classes: 'text-primary hover:text-tiktok-500' },
		{ states: ['ghost', 'youtube'], classes: 'text-primary hover:text-youtube-500' },

		{ states: ['sm', 'icon'], classes: 'px-2 py-2' },
		{ states: ['md', 'icon'], classes: 'px-3' },
		{ states: ['lg', 'icon'], classes: 'px-3' },
	];

	default = [this.primary, this.md];
}

const button = new ButtonStyles();

type Button = {
	children: ReactNode;
	className?: string;
	href?: string;
	htmlProps?: HTMLAttributes<HTMLButtonElement>;
} & StyleProps<ButtonStyles>;

export function Button({ children, href, className, htmlProps, ...styleProps }: Button) {
	return (
		<a href={href}>
			<button {...htmlProps} className={button.classes({ ...styleProps }) + className}>
				<div className='flex flex-row items-center mx-auto'>{children}</div>
			</button>
		</a>
	);
}
// const buttonStyles = cva(
// 	[
// 		'inline-flex w-full px-6 py-3 mb-3 rounded-xl shadow-sm align-middle justify-center font-medium',
// 	],
// 	{
// 		variants: {
// 			intent: {
// 				primary: ['bg-purple-400', 'text-white', 'border-transparent', 'hover:bg-purple-500'],
// 			},
// 			size: {
// 				small: ['px-6', 'py-3', 'mb-3', 'text-sm'],
// 				medium: ['px-6', 'py-3', 'mb-3', 'text-base'],
// 			},
// 		},
// 	}
// );

// icon buttons
export type IconButtonProps = {
	name: string;
	href?: string;
};

// export const IconButton = ({ name, href }: IconButtonProps) => {
// 	return (
// 		<a
// 			href={href}
// 			target='_blank'
// 			rel='noopener noreferrer'
// 			className='inline-flex items-center p-2 text-gray-100 transition-all duration-200 ease-in-out bg-transparent border border-transparent rounded-full shadow-sm hover:scale-110 active:text-red'>
// 			{Icon({ name })}
// 		</a>
// 	);
// };

// export const IconButtons = ({ icons }: { icons: IconButtonProps[] }) => {
// 	return (
// 		<>
// 			{icons.map((icon, index) => (
// 				<IconButton key={`icon.${index}`} {...icon} />
// 			))}
// 		</>
// 	);
// };
