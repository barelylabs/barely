import { useState } from 'react';

import { FieldAtom, useField, useFieldValue } from 'form-atoms';

import { cn } from '@barely/lib/utils/edge/cn';

import { FieldWrapper, FieldWrapperProps } from './field-wrapper';
import { Icon } from './icon';

const RatingField = (
	props: { fieldAtom: FieldAtom<number> } & Omit<FieldWrapperProps<number>, 'children'>,
) => {
	const [hoverRating, setHoverRating] = useState(0);
	const { fieldAtom, ...rest } = props;

	const rating = useFieldValue(fieldAtom);
	const ratingActions = useField(fieldAtom).actions;

	return (
		<FieldWrapper fieldAtom={fieldAtom} {...rest}>
			<div className='flex flex-row gap-1 items-center'>
				<button
					type='button'
					className='text-transparent -ml-5'
					onClick={() => ratingActions.setValue(0)}
				>
					<Icon.star className='w-6 h-6 p-1 -m-1' />
				</button>
				{[1, 2, 3, 4, 5].map(star => {
					const isFilled = rating >= star;
					const isHovered = hoverRating >= star;
					const isFilledButMoreThanHovered =
						hoverRating !== 0 && hoverRating < star && rating >= star;

					return (
						<button type='button' key={star} className='active:scale-90'>
							<Icon.star
								className={cn(
									'w-6 h-6 p-1 -m-1',
									isFilledButMoreThanHovered
										? 'text-yellow-300 fill-yellow-300'
										: isFilled
										? 'text-yellow-500 fill-yellow-500'
										: isHovered
										? 'text-yellow-300 fill-yellow-300'
										: 'dark:text-slate-200 dark:fill-slate-200',
								)}
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => {
									ratingActions.setValue(star);
								}}
							/>
						</button>
					);
				})}
			</div>
		</FieldWrapper>
	);
};

const RatingDisplay = (props: { rating: number; by?: string }) => {
	return (
		<div className='flex flex-row gap-2 items-center'>
			<div className='flex flex-row gap-1 items-center'>
				{[1, 2, 3, 4, 5].map((star, starIndex) => {
					const isFilled = props.rating >= star;

					return (
						<Icon.star
							key={starIndex}
							className={cn(
								'w-6 h-6 p-1 -m-1',
								isFilled
									? 'text-yellow-500 fill-yellow-500'
									: 'dark:text-slate-200 dark:fill-slate-200',
							)}
						/>
					);
				})}
			</div>
			{props.by && (
				<span className='text-sm font-light text-muted-foreground/90'>
					Reviewed by
					<span className='font-bold'> {props.by}</span>
				</span>
			)}
		</div>
	);
};
export { RatingField, RatingDisplay };
