import type { ReactNode } from 'react';

import { H, Text } from './typography';
import { WrapBalancer } from './wrap-balancer';

export const mdxTypography = {
	p: ({ children }: { children?: ReactNode }) => (
		<Text variant='lg/normal' className='text-center'>
			<WrapBalancer ratio={0}>{children}</WrapBalancer>
		</Text>
	),
	hero: ({ children }: { children?: ReactNode }) => (
		<H size='hero' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	title: ({ children }: { children?: ReactNode }) => (
		<H size='title' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h1: ({ children }: { children?: ReactNode }) => (
		<H size='1' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h2: ({ children }: { children?: ReactNode }) => (
		<H size='2' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h3: ({ children }: { children?: ReactNode }) => (
		<H size='3' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h4: ({ children }: { children?: ReactNode }) => (
		<H size='4' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h5: ({ children }: { children?: ReactNode }) => (
		<H size='5' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
};
