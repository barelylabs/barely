import { useTrackStatSearchParams } from '@barely/hooks';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TrackStatHeader } from '../track-stat-header';

// Mock the hooks
vi.mock('@barely/hooks', () => ({
	useTrackStatSearchParams: vi.fn(),
}));

// Mock the UI components
interface SelectProps {
	children: React.ReactNode;
	onValueChange?: (value: string) => void;
	defaultValue?: string;
}

interface SelectComponentProps {
	children: React.ReactNode;
	className?: string;
}

interface SelectItemProps {
	children: React.ReactNode;
	value: string;
}

vi.mock('@barely/ui/select', () => ({
	Select: ({ children, onValueChange, defaultValue }: SelectProps) => (
		<div data-testid='select' data-default-value={defaultValue}>
			{children}
			<button onClick={() => onValueChange?.('1w')}>Change to 1w</button>
		</div>
	),
	SelectTrigger: ({ children, className }: SelectComponentProps) => (
		<div className={className}>{children}</div>
	),
	SelectValue: () => <span data-testid='select-value' />,
	SelectContent: ({ children }: SelectComponentProps) => <div>{children}</div>,
	SelectItem: ({ children, value }: SelectItemProps) => (
		<div data-value={value}>{children}</div>
	),
}));

interface IconProps {
	className?: string;
}

interface TextProps {
	children: React.ReactNode;
	variant?: string;
}

vi.mock('@barely/ui/icon', () => ({
	Icon: {
		spotify: ({ className }: IconProps) => (
			<svg data-testid='spotify-icon' className={className} />
		),
	},
}));

vi.mock('@barely/ui/typography', () => ({
	Text: ({ children, variant }: TextProps) => (
		<span data-variant={variant}>{children}</span>
	),
}));

describe('TrackStatHeader', () => {
	const mockSetDateRange = vi.fn();
	const mockSetSelection = vi.fn();
	const mockAddToSelection = vi.fn();
	const mockRemoveFromSelection = vi.fn();
	const mockClearSelection = vi.fn();
	const mockSetCustomDateRange = vi.fn();
	const mockClearDateRange = vi.fn();
	const mockToggleShowPopularity = vi.fn();

	const defaultFilters = {
		selectedIds: null as string[] | 'all' | null,
		dateRange: '28d' as const,
		showPopularity: true,
		start: undefined,
		end: undefined,
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useTrackStatSearchParams).mockReturnValue({
			filters: defaultFilters,
			selectedIds: null,
			selection: new Set(),
			setSelection: mockSetSelection,
			addToSelection: mockAddToSelection,
			removeFromSelection: mockRemoveFromSelection,
			clearSelection: mockClearSelection,
			setDateRange: mockSetDateRange,
			setCustomDateRange: mockSetCustomDateRange,
			clearDateRange: mockClearDateRange,
			toggleShowPopularity: mockToggleShowPopularity,
		});
	});

	it('should render with default date range', () => {
		render(<TrackStatHeader />);

		const select = screen.getByTestId('select');
		expect(select.getAttribute('data-default-value')).toBe('28d');
	});

	it('should display all date range options', () => {
		render(<TrackStatHeader />);

		expect(screen.getByText('Last 24 hours')).toBeDefined();
		expect(screen.getByText('Last 7 days')).toBeDefined();
		expect(screen.getByText('Last 28 days')).toBeDefined();
		expect(screen.getByText('Last year')).toBeDefined();
	});

	it('should call setDateRange when selection changes', async () => {
		render(<TrackStatHeader />);

		const changeButton = screen.getByText('Change to 1w');
		fireEvent.click(changeButton);

		await waitFor(() => {
			expect(mockSetDateRange).toHaveBeenCalledWith('1w');
		});
	});

	it('should display Spotify metric indicator', () => {
		render(<TrackStatHeader />);

		expect(screen.getByTestId('spotify-icon')).toBeDefined();
		expect(screen.getByText('Spotify Popularity')).toBeDefined();
	});

	it('should apply correct styling to metric indicator', () => {
		render(<TrackStatHeader />);

		const spotifyIcon = screen.getByTestId('spotify-icon');
		expect(spotifyIcon.className).toContain('h-4 w-4 text-spotify');

		const text = screen.getByText('Spotify Popularity');
		expect(text.getAttribute('data-variant')).toBe('sm/medium');
	});

	it('should handle custom initial date range', () => {
		vi.mocked(useTrackStatSearchParams).mockReturnValue({
			filters: {
				...defaultFilters,
				dateRange: '1y',
			},
			selectedIds: null,
			selection: new Set(),
			setSelection: mockSetSelection,
			addToSelection: mockAddToSelection,
			removeFromSelection: mockRemoveFromSelection,
			clearSelection: mockClearSelection,
			setDateRange: mockSetDateRange,
			setCustomDateRange: mockSetCustomDateRange,
			clearDateRange: mockClearDateRange,
			toggleShowPopularity: mockToggleShowPopularity,
		});

		render(<TrackStatHeader />);

		const select = screen.getByTestId('select');
		expect(select.getAttribute('data-default-value')).toBe('1y');
	});
});
