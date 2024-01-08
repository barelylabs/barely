import { useEffect, useMemo, useState } from 'react';

export function useDebounceValue<T>(value: T, delay: number = 500): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	const valueMemo = useMemo(() => value, [value]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(valueMemo), delay);

		return () => {
			clearTimeout(timer);
		};
	}, [valueMemo, delay]);

	return debouncedValue;
}
