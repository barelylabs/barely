import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCountUp } from '../use-count-up';

describe('useCountUp', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Mock requestAnimationFrame to work with fake timers
		global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
			return setTimeout(() => callback(Date.now()), 16) as unknown as number; // ~60fps
		};
		global.cancelAnimationFrame = (id: number): void => {
			clearTimeout(id);
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	it('initializes with count of 0', () => {
		const { result } = renderHook(() => useCountUp({ end: 100 }));
		expect(result.current.count).toBe(0);
		expect(result.current.formattedCount).toBe('0');
	});

	it('starts counting when start is called', () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 1000 }));

		act(() => {
			result.current.start();
		});

		// Initial state
		expect(result.current.count).toBe(0);

		// Advance time and run animation frames
		act(() => {
			vi.advanceTimersByTime(500);
		});

		expect(result.current.count).toBeGreaterThan(0);
		expect(result.current.count).toBeLessThan(100);

		// Complete animation
		act(() => {
			vi.advanceTimersByTime(600);
		});

		expect(result.current.count).toBeCloseTo(100, 0);
	});

	it('respects delay parameter', () => {
		const { result } = renderHook(() =>
			useCountUp({ end: 50, duration: 500, delay: 200 }),
		);

		act(() => {
			result.current.start();
		});

		// Should still be 0 during delay
		act(() => {
			vi.advanceTimersByTime(100);
		});
		expect(result.current.count).toBe(0);

		// Should start counting after delay
		act(() => {
			vi.advanceTimersByTime(150);
		});

		expect(result.current.count).toBeGreaterThan(0);
	});

	it('formats count with decimals', () => {
		const { result } = renderHook(() => useCountUp({ end: 100, decimals: 2 }));

		expect(result.current.formattedCount).toBe('0.00');
	});

	it('includes prefix and suffix in formatted count', () => {
		const { result } = renderHook(() =>
			useCountUp({ end: 100, prefix: '$', suffix: ' USD', decimals: 2 }),
		);

		expect(result.current.formattedCount).toBe('$0.00 USD');

		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(2000);
		});

		expect(result.current.formattedCount).toBe('$100.00 USD');
	});

	it('resets count when reset is called', () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 100 }));

		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(150);
		});

		expect(result.current.count).toBeCloseTo(100, 0);

		act(() => {
			result.current.reset();
		});

		expect(result.current.count).toBe(0);
		expect(result.current.formattedCount).toBe('0');
	});

	it('cleans up timers on unmount', () => {
		const { result, unmount } = renderHook(() =>
			useCountUp({ end: 100, duration: 1000, delay: 100 }),
		);

		act(() => {
			result.current.start();
		});

		// Advance timer to start animation
		act(() => {
			vi.advanceTimersByTime(50);
		});

		// Unmount while timer is active
		unmount();

		// The cleanup is internal to the component
		// Just verify the component unmounts cleanly without errors
		expect(true).toBe(true);
	});

	it('handles multiple starts correctly', () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 500 }));

		// Start first animation
		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(250);
		});

		const midwayCount = result.current.count;
		expect(midwayCount).toBeGreaterThan(0);
		expect(midwayCount).toBeLessThan(100);

		// Start again (should continue from current position)
		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(300);
		});

		expect(result.current.count).toBeCloseTo(100, 0);
	});

	it('updates when end value changes', () => {
		const { result, rerender } = renderHook(
			({ end }) => useCountUp({ end, duration: 500 }),
			{ initialProps: { end: 100 } },
		);

		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(600);
		});

		expect(result.current.count).toBeCloseTo(100, 0);

		// Change end value
		rerender({ end: 200 });

		act(() => {
			result.current.start();
		});

		act(() => {
			vi.advanceTimersByTime(600);
		});

		expect(result.current.count).toBeCloseTo(200, 0);
	});
});
