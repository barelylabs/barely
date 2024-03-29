import { cn } from '@barely/lib/utils/cn';

interface PhoneFrameProps {
	size?: 'xs' | 'sm' | 'md' | 'lg';
	children: React.ReactNode;
}

const PhoneFrame = (props: PhoneFrameProps) => {
	return (
		<div
			className={cn(
				'device device-iphone-14-pro device-md sm:device-md',
				props.size === 'xs' && 'device-xs sm:device-xs',
				props.size === 'sm' && 'device-xs sm:device-sm',
				props.size === 'md' && 'device-sm sm:device-md',
				props.size === 'lg' && 'device-md sm:device-lg',
			)}
		>
			<div className='device-frame'>{props.children}</div>
			<div className='device-stripe'></div>
			<div className='device-header'></div>
			<div className='device-sensors'></div>
			<div className='device-btns'></div>
			<div className='device-power'></div>
			<div className='device-home'></div>
		</div>
	);
};

export { PhoneFrame };
