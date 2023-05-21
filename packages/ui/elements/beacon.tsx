import { cn } from '@barely/lib/utils/edge/cn';

interface BeaconProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Beacon = ({ className }: BeaconProps) => {
	return (
		<span
			className={cn(
				'absolute top-1 right-0 flex h-5 w-5 animate-bounce items-center justify-center z-40',
				className,
			)}
		>
			<span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-65' />
			<span className='relative inline-flex h-3 w-3 rounded-full bg-sky-500' />
		</span>
	);
};

export { Beacon };
