import type { ReactNode } from 'react';

import { H, Text } from './typography';
import { WrapBalancer } from './wrap-balancer';

export const mdxTypography = {
	p: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer ratio={0}>
			<Text variant='lg/normal' className='text-center'>
				{children}
			</Text>
		</WrapBalancer>
	),
	hero: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='hero' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	title: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='title' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	h1: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='1' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	h2: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='2' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	h3: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='3' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	h4: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='4' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
	h5: ({ children }: { children?: ReactNode }) => (
		<WrapBalancer>
			<H size='5' className='text-center'>
				{children}
			</H>
		</WrapBalancer>
	),
};
