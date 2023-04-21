import { useEffect, useMemo, useState } from 'react';

// https://usehooks.com/useDebounce
function useDebouncedValue<T extends string | number>(value: T, delay: number): T {
	// state and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);
	const valueMemo = useMemo(() => value, [value]);

	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				setDebouncedValue(valueMemo);
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[valueMemo, delay], // Only re-call effect if value or delay changes
	);
	return debouncedValue;
}

export { useDebouncedValue };
