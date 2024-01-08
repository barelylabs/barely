import { useEffect, useMemo, useState } from 'react';

export function useDebounce<T>(
	realtimeValue: T,
	delay: number = 500,
): [T, (value: T) => void, boolean, T] {
	const [debouncedValue, setDebouncedValue] = useState<T>(realtimeValue);

	const realtimeValueMemo = useMemo(() => realtimeValue, [realtimeValue]);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(realtimeValue), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [realtimeValueMemo, delay]);

	const isDebounced = debouncedValue === realtimeValue;

	return [debouncedValue, setDebouncedValue, isDebounced, realtimeValue];
}
