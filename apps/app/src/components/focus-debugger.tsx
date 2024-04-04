'use client';

import { useEffect } from 'react';

function FocusDebugger() {
	useEffect(() => {
		const handleFocusIn = (event: FocusEvent) => {
			const focusedElement = event.target as HTMLElement;
			console.log('Focused element:', focusedElement);
			console.log('Tag:', focusedElement.tagName);
			console.log('Classes:', focusedElement.className);
			console.log('ID:', focusedElement.id);
			// Add any other attributes you're interested in
		};

		// Add the event listener when the component mounts
		window.addEventListener('focusin', handleFocusIn);

		// Remove the event listener when the component unmounts
		return () => {
			window.removeEventListener('focusin', handleFocusIn);
		};
	}, []);

	return null; // This component does not render anything
}

export default FocusDebugger;
