'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PrintLabelPage() {
	const searchParams = useSearchParams();
	const labelUrl = searchParams.get('url');
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const hasPrinted = useRef(false);

	useEffect(() => {
		if (!labelUrl || hasPrinted.current) return;

		const iframe = iframeRef.current;
		if (!iframe) return;

		const handleLoad = () => {
			if (hasPrinted.current) return;
			hasPrinted.current = true;

			// Small delay to ensure the PDF is fully rendered in the iframe
			setTimeout(() => {
				try {
					iframe.contentWindow?.print();
				} catch {
					// Cross-origin PDF - fall back to printing the whole page
					window.print();
				}
			}, 500);
		};

		iframe.addEventListener('load', handleLoad);
		return () => iframe.removeEventListener('load', handleLoad);
	}, [labelUrl]);

	if (!labelUrl) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<p>No label URL provided.</p>
			</div>
		);
	}

	return (
		<div className='flex h-screen flex-col bg-white'>
			{/* Screen-only header */}
			<div className='p-4 text-center print:hidden'>
				<p className='text-sm text-muted-foreground'>
					Print dialog should open automatically. If not,{' '}
					<button
						onClick={() => {
							try {
								iframeRef.current?.contentWindow?.print();
							} catch {
								window.print();
							}
						}}
						className='text-primary underline'
					>
						click here to print
					</button>
					.
				</p>
			</div>

			<iframe
				ref={iframeRef}
				src={labelUrl}
				title='Shipping Label'
				className='flex-1 border-0 print:fixed print:inset-0 print:h-full print:w-full'
			/>
		</div>
	);
}
