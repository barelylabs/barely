'use client';

import { MarketingButton } from '../../../components/marketing/button';
import { useContactModal } from '../../../contexts/contact-modal-context';

export function GoalsButton() {
	const { open } = useContactModal();

	return (
		<MarketingButton
			marketingLook='hero-primary'
			size='lg'
			className='min-w-[200px]'
			onClick={open}
		>
			Tell Us Your Goals
		</MarketingButton>
	);
}
