import { useEffect, useState } from 'react';
import { useToast } from '@barely/toast';

export function useCopy() {
	const [isCopied, setIsCopied] = useState(false);
	const { toast } = useToast();

	const copyToClipboard = (
		text: string,
		{
			successMessage = 'Copied to clipboard!',
		}: {
			successMessage?: string;
		} = {},
	) => {
		navigator?.clipboard
			?.writeText(text)
			.then(() => setIsCopied(true))
			.then(() => {
				toast.success(successMessage, {
					duration: 1500,
				});
			})
			.catch(error => console.error('Copy to clipboard failed:', error));
	};

	const resetCopyStatus = () => {
		setIsCopied(false);
	};

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(resetCopyStatus, 3000); // Reset copy status after 3 seconds

			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	return { isCopied, copyToClipboard, resetCopyStatus };
}
