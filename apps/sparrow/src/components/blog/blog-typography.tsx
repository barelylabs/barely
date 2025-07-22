import type { ReactNode } from 'react';

import { H } from '@barely/ui/typography';

export const blogTypography = {
	p: ({ children }: { children?: ReactNode }) => (
		<p className='mb-6 leading-relaxed text-white/80'>{children}</p>
	),
	h1: ({ children }: { children?: ReactNode }) => (
		<H size='1' className='mb-8 mt-12 text-white'>
			{children}
		</H>
	),
	h2: ({ children }: { children?: ReactNode }) => (
		<H size='2' className='mb-6 mt-10 text-white'>
			{children}
		</H>
	),
	h3: ({ children }: { children?: ReactNode }) => (
		<H size='3' className='mb-4 mt-8 text-white'>
			{children}
		</H>
	),
	h4: ({ children }: { children?: ReactNode }) => (
		<H size='4' className='mb-3 mt-6 text-white'>
			{children}
		</H>
	),
	h5: ({ children }: { children?: ReactNode }) => (
		<H size='5' className='mb-2 mt-4 text-white'>
			{children}
		</H>
	),
	h6: ({ children }: { children?: ReactNode }) => (
		<H size='6' className='mb-2 mt-4 text-white'>
			{children}
		</H>
	),
	ul: ({ children }: { children?: ReactNode }) => (
		<ul className='mb-6 list-inside list-disc space-y-2 text-white/80'>{children}</ul>
	),
	ol: ({ children }: { children?: ReactNode }) => (
		<ol className='mb-6 list-inside list-decimal space-y-2 text-white/80'>{children}</ol>
	),
	li: ({ children }: { children?: ReactNode }) => (
		<li className='text-white/80'>{children}</li>
	),
	blockquote: ({ children }: { children?: ReactNode }) => (
		<blockquote className='mb-6 border-l-4 border-purple-500/50 pl-6 italic text-white/70'>
			{children}
		</blockquote>
	),
	code: ({ children }: { children?: ReactNode }) => (
		<code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-purple-300'>
			{children}
		</code>
	),
	pre: ({ children }: { children?: ReactNode }) => (
		<pre className='mb-6 overflow-x-auto rounded-lg bg-white/5 p-4'>{children}</pre>
	),
	a: ({ href, children }: { href?: string; children?: ReactNode }) => (
		<a
			href={href}
			className='text-purple-300 underline underline-offset-2 hover:text-purple-300'
			target={href?.startsWith('http') ? '_blank' : undefined}
			rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
		>
			{children}
		</a>
	),
	hr: () => <hr className='my-8 border-white/10' />,
};
