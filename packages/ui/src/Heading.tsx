import { Style, StyleProps } from '@barely/class';
import { HTMLAttributes, ReactNode } from 'react';

class HeadingStyles extends Style {
	base = 'font-bold leading-normal ';

	primary = 'text-blue-500';
	secondary = 'text-secondary';
	tertiary = 'text-tertiary';

	sm = 'text-2xl';
	md = 'text-4xl';
	lg = 'text-5xl ';
	xl = 'text-6xl';

	default = [this.base, this.primary, this.md];
}

const heading = new HeadingStyles();

type Heading = {
	children: ReactNode;
	htmlProps?: HTMLAttributes<HTMLHeadingElement>;
} & StyleProps<HeadingStyles>;

export function Heading({ children, htmlProps, ...styleProps }: Heading) {
	return (
		<h1 {...htmlProps} className={heading.classes({ ...styleProps })}>
			{children}
		</h1>
	);
}
