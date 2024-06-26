export interface LogoProps {
	className?: string;
}

export const Logo = ({ className }: LogoProps) => (
	<svg
		id='Layer_1'
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 272.92 288.56'
		className={className}
	>
		<circle cx='200.95' cy='216.26' r='71.97' fill='#ea0d80' />
		<line x1='36.08' y1='252.48' x2='131.87' y2='36.08' fill='none' />
		<path
			d='m36.06,288.56c-4.88,0-9.84-.99-14.58-3.1-18.22-8.06-26.45-29.37-18.38-47.59L98.89,21.48c8.06-18.21,29.37-26.45,47.58-18.38,18.22,8.06,26.45,29.37,18.38,47.59l-95.8,216.39c-5.96,13.47-19.16,21.48-33,21.48h.01Z'
			fill='#2b8fce'
		/>
		<circle cx='200.95' cy='216.26' r='28.83' fill='#f89b49' />
	</svg>
);
