/* eslint-disable @typescript-eslint/no-explicit-any */ // fixme once react 19 is supported
// import type { ReactNode } from 'react';

import { H } from './typography';
import { WrapBalancer } from './wrap-balancer';

export const mdxTypography = {
	p: ({ children }: { children?: any }) => (
		// <Text variant='md/normal' className='text-center text-[1.125rem]'>
		<p className='text-center align-text-bottom text-sm leading-snug sm:text-[1.05rem] sm:leading-[1.425rem]'>
			<WrapBalancer ratio={0}>{children}</WrapBalancer>
		</p>
	),
	h1: ({ children }: { children?: any }) => (
		<H size='1' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h2: ({ children }: { children?: any }) => (
		<H size='2' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h3: ({ children }: { children?: any }) => (
		<H size='3' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h4: ({ children }: { children?: any }) => (
		<H size='4' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h5: ({ children }: { children?: any }) => (
		<H size='5' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
	h6: ({ children }: { children?: any }) => (
		<H size='6' className='text-center'>
			<WrapBalancer>{children}</WrapBalancer>
		</H>
	),
};
