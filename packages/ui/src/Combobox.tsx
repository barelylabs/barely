import { cn } from '@barely/utils/edge';
import { Combobox as HeadlessCombobox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type InputSize = 'sm' | 'md' | 'lg';
interface ComboboxProps<T extends any> {
	options: T[];
	optImgSrc?: (option: T) => string | undefined;
	optImgAlt?: (option: T) => string | undefined;
	optTitle?: (option: T) => string | undefined;
	optSubtitle?: (option: T) => string | undefined;
	optDisplay?: (option: T) => React.ReactNode;

	value: T | null;
	valueOnChange: (value: T) => void;

	inputOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	displayValue: (option: T) => string;
}

export function Combobox<T>(props: ComboboxProps<T>) {
	const { options, optImgSrc, optImgAlt, optTitle, optSubtitle, optDisplay } = props;
	return (
		<HeadlessCombobox as='div' value={props.value} onChange={props.valueOnChange}>
			<div className='relative'>
				<HeadlessCombobox.Input
					className='w-full rounded-lg bg-white py-3 px-5   sm:text-sm'
					onChange={props.inputOnChange}
					displayValue={props.displayValue ?? ''}
					placeholder='type your track name or URL from Spotify'
				/>
				<HeadlessCombobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
					<ChevronUpDownIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
				</HeadlessCombobox.Button>

				{options && options.length > 0 && (
					<HeadlessCombobox.Options className='absolute z-10 mt-3 max-h-60 w-full overflow-auto rounded-md bg-white py-2 text-base shadow-md shadow-gray-300 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
						{options.map((opt, index) => (
							<HeadlessCombobox.Option
								key={`track.${index}`}
								value={opt}
								className={({ active }) =>
									cn(
										'relative cursor-default select-none py-2 pl-3 pr-9',
										active ? 'bg-purple-600 text-white' : 'text-gray-900',
									)
								}
							>
								{({ active, selected }) => (
									<div className='flex items-center'>
										{optImgSrc && (
											<img
												src={optImgSrc(opt)}
												alt={optImgAlt && optImgAlt(opt)}
												className='h-10 w-10 flex-shrink-0 rounded-sm'
											/>
										)}
										<div className='flex flex-col'>
											<span
												className={cn(
													'ml-3 truncate text-gray-800',
													(active || selected) && 'text-white',
													selected && 'font-semibold',
												)}
											>
												{optTitle && optTitle(opt)}
											</span>
											<span
												className={cn(
													'ml-3 truncate text-gray-500',
													(active || selected) && 'text-gray-300',
													selected ? 'font-semibold' : '',
												)}
											>
												{optSubtitle && optSubtitle(opt)}
											</span>
										</div>
									</div>
								)}
							</HeadlessCombobox.Option>
						))}
					</HeadlessCombobox.Options>
				)}
			</div>
		</HeadlessCombobox>
	);
}
