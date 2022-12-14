import { HTMLAttributes, ReactNode } from 'react';
import { Style, StyleProps } from '@barely/class';
import { FaInstagram, FaSpotify, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import { IoIosRocket } from 'react-icons/io';

class IconStyles extends Style {
	base = 'my-auto';

	sm = 'w-4 h-4';
	md = 'w-6 h-6';
	lg = 'w-8 h-8';

	default = [this.sm];
}

const icon = new IconStyles();

type Icon = {
	name: 'rocket' | 'spotify' | 'instagram' | 'twitter' | 'tiktok' | 'youtube';
	className?: string;
} & StyleProps<IconStyles>;

export const Icon = ({ name, className: plusClass, ...styleProps }: Icon) => {
	const className = icon.classes({ ...styleProps }) + plusClass; //{ className: className ?? 'h-4 w-4 my-auto' };
	if (name === 'instagram') return <FaInstagram {...{ className }} />;
	if (name === 'rocket') return <IoIosRocket {...{ className }} />;
	if (name === 'spotify') return <FaSpotify {...{ className }} />;
	if (name === 'tiktok') return <FaTiktok {...{ className }} />;
	if (name === 'twitter') return <FaTwitter {...{ className }} />;
	if (name === 'youtube') return <FaYoutube {...{ className }} />;
	return null;
};
