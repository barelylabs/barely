import type { ComputedStyles } from '@barely/utils';
import type { ReactNode } from 'react';

/**
 * Shared components for markdown rendering with brand kit styles.
 * These are used by both MarkdownBlock (client) and MarkdownBlockServer.
 */
export function createMarkdownComponents(computedStyles: ComputedStyles) {
	return {
		p: ({ children }: { children?: ReactNode }) => (
			<p
				className='mb-4 text-center text-brandKit-text last:mb-0'
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
				}}
			>
				{children}
			</p>
		),
		h1: ({ children }: { children?: ReactNode }) => (
			<h1
				className='mb-4 text-center text-2xl font-bold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h1>
		),
		h2: ({ children }: { children?: ReactNode }) => (
			<h2
				className='mb-3 text-center text-xl font-semibold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h2>
		),
		h3: ({ children }: { children?: ReactNode }) => (
			<h3
				className='mb-2 text-center text-lg font-semibold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h3>
		),
		h4: ({ children }: { children?: ReactNode }) => (
			<h4
				className='mb-2 text-center text-base font-semibold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h4>
		),
		h5: ({ children }: { children?: ReactNode }) => (
			<h5
				className='mb-2 text-center text-sm font-semibold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h5>
		),
		h6: ({ children }: { children?: ReactNode }) => (
			<h6
				className='mb-2 text-center text-xs font-semibold text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.headingFont,
				}}
			>
				{children}
			</h6>
		),
		ul: ({ children }: { children?: ReactNode }) => (
			<ul
				className='mb-4 list-inside list-disc space-y-1 text-center text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
				}}
			>
				{children}
			</ul>
		),
		ol: ({ children }: { children?: ReactNode }) => (
			<ol
				className='mb-4 list-inside list-decimal space-y-1 text-center text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
				}}
			>
				{children}
			</ol>
		),
		blockquote: ({ children }: { children?: ReactNode }) => (
			<blockquote
				className='border-brandKit-text/20 mx-auto mb-4 max-w-md border-l-4 pl-4 text-center italic text-brandKit-text'
				style={{
					fontFamily: computedStyles.fonts.bodyFont,
				}}
			>
				{children}
			</blockquote>
		),
		a: ({ href, children }: { href?: string; children?: ReactNode }) => (
			<a
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-brandKit-text underline transition-opacity hover:opacity-80'
			>
				{children}
			</a>
		),
		strong: ({ children }: { children?: ReactNode }) => (
			<strong className='font-bold text-brandKit-text'>{children}</strong>
		),
		em: ({ children }: { children?: ReactNode }) => (
			<em className='italic text-brandKit-text'>{children}</em>
		),
		u: ({ children }: { children?: ReactNode }) => (
			<u className='text-brandKit-text underline'>{children}</u>
		),
		code: ({ children }: { children?: ReactNode }) => (
			<code
				className='bg-brandKit-text/10 rounded px-1 py-0.5 text-sm text-brandKit-text'
				style={{
					fontFamily: 'monospace',
				}}
			>
				{children}
			</code>
		),
		pre: ({ children }: { children?: ReactNode }) => (
			<pre
				className='bg-brandKit-text/10 mb-4 overflow-x-auto rounded-lg p-4 text-brandKit-text'
				style={{
					fontFamily: 'monospace',
				}}
			>
				{children}
			</pre>
		),
		hr: () => <hr className='border-brandKit-text/20 my-6' />,
		// For react-markdown compatibility
		li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
	};
}

interface MarkdownBlockHeaderProps {
	title?: string | null;
	subtitle?: string | null;
	headingFont: string;
	bodyFont: string;
}

/**
 * Shared header component for markdown blocks
 */
export function MarkdownBlockHeader({
	title,
	subtitle,
	headingFont,
	bodyFont,
}: MarkdownBlockHeaderProps) {
	if (!title && !subtitle) return null;

	return (
		<div className='space-y-1 text-center'>
			{title && (
				<div
					className='text-3xl font-bold text-brandKit-text'
					style={{
						fontFamily: headingFont,
					}}
				>
					{title}
				</div>
			)}
			{subtitle && (
				<div
					className='text-xs text-brandKit-text opacity-80'
					style={{
						fontFamily: bodyFont,
					}}
				>
					{subtitle}
				</div>
			)}
		</div>
	);
}
