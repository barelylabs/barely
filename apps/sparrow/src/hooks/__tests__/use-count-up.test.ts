import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useCountUp } from '../use-count-up';

describe('useCountUp', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('initializes with count of 0', () => {
		const { result } = renderHook(() => useCountUp({ end: 100 }));
		expect(result.current.count).toBe(0);
		expect(result.current.formattedCount).toBe('0');
	});

	it('starts counting when start is called', async () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 1000 }));

		act(() => {
			result.current.start();
		});

		// Initial state
		expect(result.current.count).toBe(0);

		// Advance time and check progress
		act(() => {
			vi.advanceTimersByTime(500);
		});

		await waitFor(() => {
			expect(result.current.count).toBeGreaterThan(0);
			expect(result.current.count).toBeLessThan(100);
		});

		// Complete animation
		act(() => {
			vi.advanceTimersByTime(600);
		});

		await waitFor(() => {
			expect(result.current.count).toBeCloseTo(100, 0);
		});
	});

	it('respects delay parameter', async () => {
		const { result } = renderHook(() => 
			useCountUp({ end: 50, duration: 500, delay: 200 })
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

		await waitFor(() => {
			expect(result.current.count).toBeGreaterThan(0);
		});
	});

	it('formats count with decimals', () => {
		const { result } = renderHook(() => 
			useCountUp({ end: 100, decimals: 2 })
		);

		expect(result.current.formattedCount).toBe('0.00');
	});

	it('includes prefix and suffix in formatted count', async () => {
		const { result } = renderHook(() => 
			useCountUp({ end: 100, prefix: '$', suffix: ' USD', decimals: 2 })
		);

		expect(result.current.formattedCount).toBe('$0.00 USD');

		act(() => {
			result.current.start();
			vi.advanceTimersByTime(2000);
		});

		await waitFor(() => {
			expect(result.current.formattedCount).toBe('$100.00 USD');
		});
	});

	it('resets count when reset is called', async () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 100 }));

		act(() => {
			result.current.start();
			vi.advanceTimersByTime(150);
		});

		await waitFor(() => {
			expect(result.current.count).toBeCloseTo(100, 0);
		});

		act(() => {
			result.current.reset();
		});

		expect(result.current.count).toBe(0);
		expect(result.current.formattedCount).toBe('0');
	});

	it('cleans up timers on unmount', () => {
		const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
		const cancelAnimationFrameSpy = vi.spyOn(global, 'cancelAnimationFrame');

		const { result, unmount } = renderHook(() => 
			useCountUp({ end: 100, duration: 1000 })
		);

		act(() => {
			result.current.start();
		});

		unmount();

		expect(clearTimeoutSpy).toHaveBeenCalled();
		expect(cancelAnimationFrameSpy).toHaveBeenCalled();
	});

	it('handles multiple starts correctly', async () => {
		const { result } = renderHook(() => useCountUp({ end: 100, duration: 500 }));

		// Start first animation
		act(() => {
			result.current.start();
			vi.advanceTimersByTime(250);
		});

		const midwayCount = result.current.count;
		expect(midwayCount).toBeGreaterThan(0);
		expect(midwayCount).toBeLessThan(100);

		// Start again (should continue from current position)
		act(() => {
			result.current.start();
			vi.advanceTimersByTime(300);
		});

		await waitFor(() => {
			expect(result.current.count).toBeCloseTo(100, 0);
		});
	});

	it('updates when end value changes', async () => {
		const { result, rerender } = renderHook(
			({ end }) => useCountUp({ end, duration: 500 }),
			{ initialProps: { end: 100 } }
		);

		act(() => {
			result.current.start();
			vi.advanceTimersByTime(600);
		});

		await waitFor(() => {
			expect(result.current.count).toBeCloseTo(100, 0);
		});

		// Change end value
		rerender({ end: 200 });

		act(() => {
			result.current.start();
			vi.advanceTimersByTime(600);
		});

		await waitFor(() => {
			expect(result.current.count).toBeCloseTo(200, 0);
		});
	});
});