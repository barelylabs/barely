import type { ReactNode } from 'react';

import { H, Text } from './typography';

export const mdxTypography = {
	p: ({ children }: { children?: ReactNode }) => (
		<Text variant='lg/normal' className='text-center'>
			{children}
		</Text>
	),
	hero: ({ children }: { children?: ReactNode }) => <H size='hero'>{children}</H>,
	title: ({ children }: { children?: ReactNode }) => <H size='title'>{children}</H>,
	h1: ({ children }: { children?: ReactNode }) => <H size='1'>{children}</H>,
	h2: ({ children }: { children?: ReactNode }) => <H size='2'>{children}</H>,
	h3: ({ children }: { children?: ReactNode }) => <H size='3'>{children}</H>,
	h4: ({ children }: { children?: ReactNode }) => <H size='4'>{children}</H>,
	h5: ({ children }: { children?: ReactNode }) => <H size='5'>{children}</H>,
};
