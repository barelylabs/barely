import { forwardRef } from 'react';

export const BottomThirdFadeGradient = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
	return (
		<div
			ref={ref}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 33%)',
			}}
		></div>
	);
});
BottomThirdFadeGradient.displayName = 'BottomThirdFadeGradient';
