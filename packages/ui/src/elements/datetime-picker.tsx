// https://shadcnui-expansions.typeart.cc/docs/datetime-picker

'use client';

import type { CalendarDate } from '@internationalized/date';
import type { DateSegment as IDateSegment } from '@react-stately/datepicker';
import type {
	AriaDatePickerProps,
	AriaTimeFieldProps,
	CalendarProps,
	DateValue,
	TimeValue,
} from 'react-aria';
import type {
	CalendarState,
	DateFieldState,
	DatePickerState,
	DatePickerStateOptions,
	TimeFieldStateOptions,
} from 'react-stately';
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { cn } from '@barely/utils';
import {
	isToday as _isToday,
	createCalendar,
	fromDate,
	getLocalTimeZone,
	getWeeksInMonth,
	parseDateTime,
	toCalendarDate,
	toCalendarDateTime,
} from '@internationalized/date';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, X } from 'lucide-react';
import {
	useCalendar,
	useCalendarCell,
	useCalendarGrid,
	useDateField,
	useDatePicker,
	useDateSegment,
	useLocale,
	useTimeField,
} from 'react-aria';
import {
	useCalendarState,
	useDateFieldState,
	useDatePickerState,
	useTimeFieldState,
} from 'react-stately';

import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

function Calendar(props: CalendarProps<DateValue>) {
	const prevButtonRef = React.useRef<HTMLButtonElement | null>(null);
	const nextButtonRef = React.useRef<HTMLButtonElement | null>(null);

	const { locale } = useLocale();
	const state = useCalendarState({
		...props,
		locale,
		createCalendar,
	});
	const {
		calendarProps,
		prevButtonProps: _prevButtonProps,
		nextButtonProps: _nextButtonProps,
		title,
	} = useCalendar(props, state);
	// const { buttonProps: prevButtonProps } = useButton(_prevButtonProps, prevButtonRef);
	// const { buttonProps: nextButtonProps } = useButton(_nextButtonProps, nextButtonRef);

	return (
		<div {...calendarProps} className='space-y-4'>
			<div className='relative flex items-center justify-center pt-1'>
				<Button
					{..._prevButtonProps}
					ref={prevButtonRef}
					look='outline'
					className={cn(
						'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
					)}
				>
					<ChevronLeftIcon className='h-4 w-4' />
				</Button>
				<div className='text-sm font-medium'>{title}</div>
				<Button
					{..._nextButtonProps}
					ref={nextButtonRef}
					look='outline'
					className={cn(
						'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
					)}
				>
					<ChevronRightIcon className='h-4 w-4' />
				</Button>
			</div>
			<CalendarGrid state={state} />
		</div>
	);
}

interface CalendarGridProps {
	state: CalendarState;
}

function CalendarGrid({ state, ...props }: CalendarGridProps) {
	const { locale } = useLocale();
	const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

	// Get the number of weeks in the month so we can render the proper number of rows.
	const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

	return (
		<table
			{...gridProps}
			className={cn(gridProps.className, 'w-full border-collapse space-y-1')}
		>
			<thead {...headerProps}>
				<tr className='flex'>
					{weekDays.map((day, index) => (
						<th
							className='w-9 rounded-md text-[0.8rem] font-normal text-muted-foreground'
							key={index}
						>
							{day}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{[...new Array(weeksInMonth).keys()].map(weekIndex => (
					<tr className='mt-2 flex w-full' key={weekIndex}>
						{state
							.getDatesInWeek(weekIndex)
							.map((date, i) =>
								date ?
									<CalendarCell key={i} state={state} date={date} />
								:	<td key={i} />,
							)}
					</tr>
				))}
			</tbody>
		</table>
	);
}

interface CalendarCellProps {
	state: CalendarState;
	date: CalendarDate;
}

function CalendarCell({ state, date }: CalendarCellProps) {
	const ref = React.useRef<HTMLButtonElement | null>(null);
	const {
		cellProps,
		buttonProps,
		isSelected,
		isOutsideVisibleRange,
		isDisabled,
		formattedDate,
	} = useCalendarCell({ date }, state, ref);

	const isToday = useMemo(() => {
		const timezone = getLocalTimeZone();
		return _isToday(date, timezone);
	}, [date]);

	return (
		<td
			{...cellProps}
			className={cn(
				cellProps.className,
				'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
			)}
		>
			<Button
				{...buttonProps}
				type='button'
				look='ghost'
				ref={ref}
				className={cn(
					buttonProps.className,
					'h-9 w-9',
					isToday && 'bg-accent text-accent-foreground',
					isSelected &&
						'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
					isOutsideVisibleRange && 'text-muted-foreground opacity-50',
					isDisabled && 'text-muted-foreground opacity-50',
				)}
				onFocus={e => {
					if (buttonProps.onFocus) {
						// @ts-expect-error - onFocus is not a function
						buttonProps.onFocus(e);
					}
				}}
				onBlur={e => {
					if (buttonProps.onBlur) {
						// @ts-expect-error - onBlur is not a function
						buttonProps.onBlur(e);
					}
				}}
				// onFocus={e => {
				// 	if (buttonProps.onFocus) {
				// 		buttonProps.onFocus(e as unknown as FocusEvent<React.FocusableElement, Element>);
				// 	}
				// }}
				// onBlur={undefined}
			>
				{formattedDate}
			</Button>
		</td>
	);
}

interface DateSegmentProps {
	segment: IDateSegment;
	state: DateFieldState;
}

function DateSegment({ segment, state }: DateSegmentProps) {
	const ref = useRef(null);

	const {
		segmentProps: { ...segmentProps },
	} = useDateSegment(segment, state, ref);

	return (
		<div
			{...segmentProps}
			ref={ref}
			className={cn(
				'focus:rounded-[2px] focus:bg-accent focus:text-accent-foreground focus:outline-none',
				segment.type !== 'literal' && 'px-[1px]',
				segment.isPlaceholder && 'text-muted-foreground',
			)}
		>
			{segment.text}
		</div>
	);
}

function DateField(props: AriaDatePickerProps<DateValue>) {
	const ref = useRef<HTMLDivElement | null>(null);

	const { locale } = useLocale();
	const state = useDateFieldState({
		...props,
		locale,
		createCalendar,
	});
	const { fieldProps } = useDateField(props, state, ref);

	return (
		<div
			{...fieldProps}
			ref={ref}
			className={cn(
				'inline-flex h-10 flex-1 items-center rounded-l-md border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				props.isDisabled && 'cursor-not-allowed opacity-50',
			)}
		>
			{state.segments.map((segment, i) => (
				<DateSegment key={i} segment={segment} state={state} />
			))}
			{state.isInvalid && <span aria-hidden='true'>🚫</span>}
		</div>
	);
}

function TimeField(props: AriaTimeFieldProps<TimeValue>) {
	const ref = useRef<HTMLDivElement | null>(null);

	const { locale } = useLocale();
	const state = useTimeFieldState({
		...props,
		locale,
	});
	const {
		fieldProps: { ...fieldProps },
	} = useTimeField(props, state, ref);

	return (
		<div
			{...fieldProps}
			ref={ref}
			className={cn(
				'inline-flex h-10 w-full flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
				props.isDisabled && 'cursor-not-allowed opacity-50',
			)}
		>
			{state.segments.map((segment, i) => (
				<DateSegment key={i} segment={segment} state={state} />
			))}
		</div>
	);
}

// const TimePicker = React.forwardRef<
// 	HTMLDivElement,
// 	Omit<TimeFieldStateOptions<TimeValue>, 'locale'>
// >((props, ref) => {
// 	return <TimeField {...props}/>;
// });

const TimePicker = (props: Omit<TimeFieldStateOptions<TimeValue>, 'locale'>) => {
	return <TimeField {...props} />;
};

TimePicker.displayName = 'TimePicker';

export interface DateTimePickerRef {
	divRef: HTMLDivElement | null;
	buttonRef: HTMLButtonElement | null;
	contentRef: HTMLDivElement | null;
	jsDate: Date | null;
	state: DatePickerState;
}

export type DateTimePickerProps = DatePickerStateOptions<DateValue> & {
	jsDate?: Date | null;
	onJsDateChange?: (date: Date) => void;
	showClearButton?: boolean;
};

const DateTimePicker = React.forwardRef<
	DateTimePickerRef,
	DatePickerStateOptions<DateValue> & {
		jsDate?: Date | null;
		onJsDateChange?: (date: Date) => void;
		showClearButton?: boolean;
	}
>(({ jsDate, onJsDateChange, showClearButton = true, ...props }, ref) => {
	const divRef = useRef<HTMLDivElement | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const contentRef = useRef<HTMLDivElement | null>(null);
	const [jsDatetime, setJsDatetime] = useState(jsDate ?? null);

	const state = useDatePickerState(props);

	useImperativeHandle(ref, () => ({
		divRef: divRef.current,
		buttonRef: buttonRef.current,
		contentRef: contentRef.current,
		jsDate: jsDatetime,
		state,
	}));
	const {
		groupProps,
		fieldProps,
		buttonProps: _buttonProps,
		dialogProps,
		calendarProps,
	} = useDatePicker(props, state, divRef);

	const currentValue = useCallback(() => {
		if (!jsDatetime) {
			return null;
		}

		const parsed = fromDate(jsDatetime, getLocalTimeZone());

		if (state.hasTime) {
			return toCalendarDateTime(parsed);
		}

		return toCalendarDate(parsed);
	}, [jsDatetime, state.hasTime]);

	const onJsDateChangeRef = useRef(onJsDateChange);

	useEffect(() => {
		/**
		 * If user types datetime, it will be a null value until we get the correct datetime.
		 * This is controlled by react-aria.
		 **/
		if (state.value) {
			const date = parseDateTime(state.value.toString()).toDate(getLocalTimeZone());
			setJsDatetime(date);
			onJsDateChangeRef.current?.(date);
		}
	}, [state.value]);
	return (
		<div
			{...groupProps}
			ref={divRef}
			className={cn(
				groupProps.className,
				'flex items-center rounded-md border ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
			)}
		>
			<Popover open={props.isOpen} onOpenChange={props.onOpenChange}>
				<PopoverTrigger asChild>
					<Button
						{..._buttonProps}
						look='ghost'
						className='border-r'
						disabled={props.isDisabled}
						onClick={() => {
							state.setOpen(true);
						}}
					>
						<CalendarIcon className='h-5 w-5' />
					</Button>
				</PopoverTrigger>
				<PopoverContent ref={contentRef} className='w-full'>
					<div {...dialogProps} className='space-y-3'>
						<Calendar {...calendarProps} />
						{state.hasTime && (
							<TimeField
								value={state.timeValue}
								onChange={v => {
									if (v) state.setTimeValue(v);
								}}
							/>
						)}
					</div>
				</PopoverContent>
			</Popover>

			<DateField {...fieldProps} value={currentValue()} />

			<div className={cn('-ml-2 mr-2 h-5 w-5', !showClearButton && 'hidden')}>
				<X
					className={cn(
						'h-5 w-5 cursor-pointer text-primary/30',
						!jsDatetime && 'hidden',
					)}
					onClick={() => setJsDatetime(null)}
				/>
			</div>
		</div>
	);
});

DateTimePicker.displayName = 'DateTimePicker';

export { DateTimePicker, TimePicker };
