import { cva } from 'class-variance-authority';

const buttonVariants = cva(
	'inline-flex w-fit items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				button: '',
				icon: 'flex justify-center',
			},

			look: {
				primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',

				brand: 'bg-brand text-brand-foreground hover:bg-brand/90',
				brandAccent:
					'bg-brand-accent text-brand-accent-foreground hover:bg-brand-accent/90',
				success: 'bg-success text-success-foreground hover:bg-success/80',

				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
				outline:
					'border-[1.5px] border-input bg-transparent hover:bg-accent hover:text-accent-foreground ',
				muted: 'bg-muted text-muted-foreground hover:bg-muted/90',
				minimal: 'bg-transparent text-muted-foreground hover:bg-muted',
				ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
				link: '!focus:ring-transparent !m-0 !h-fit bg-transparent !p-0 text-primary underline-offset-4 ring-transparent ring-offset-transparent hover:underline',
				tab: '!focus:ring-transparent',
			},

			size: {
				xs: 'h-5 rounded-md px-[2px] py-[2px] text-xs',
				sm: 'h-6 rounded-md px-2 py-1 text-sm',
				md: 'h-9 rounded-md px-4 py-2.5 text-sm md:text-md',
				lg: 'h-[36px] rounded-md px-6 py-4 text-md md:px-8 md:py-6 md:text-lg',
				xl: 'h-[44px] rounded-md px-8 py-5 text-md md:px-10 md:py-7 md:text-lg',
			},

			loading: {
				true: 'cursor-wait',
			},

			pill: {
				true: '!rounded-full',
			},

			fullWidth: {
				true: '!w-full',
			},

			selected: {
				true: '',
				false: '',
			},
		},
		compoundVariants: [
			/** tabs */
			{
				look: 'tab',
				selected: true,
				className: 'bg-muted text-primary',
			},
			{
				look: 'tab',
				selected: false,
				className: 'bg-muted/10 text-secondary-foreground ',
			},
			/** icon sizes */
			{
				variant: 'icon',
				size: 'xs',
				className: 'h-4 w-4 !p-[2px]',
			},
			{
				variant: 'icon',
				size: 'sm',
				className: 'h-6 w-6 !p-1',
			},
			{
				variant: 'icon',
				size: 'md',
				className: 'hover:border-default h-7 w-7 !p-2',
			},
			{
				variant: 'icon',
				size: 'lg',
				className: 'hover:border-default h-10 w-10 !p-2',
			},
		],
		defaultVariants: {
			variant: 'button',
			look: 'primary',
			size: 'md',
		},
	},
);

type ButtonVariants = typeof buttonVariants;

const buttonIconVariants = cva('', {
	variants: {
		variant: {
			icon: '',
			button: 'stroke-[1.5px]',
		},
		look: {
			primary: 'text-primary-foreground',
			secondary: 'text-secondary-foreground',
			brand: 'text-brand-foreground',
			brandAccent: 'text-brand-accent-foreground',
			success: 'text-success-foreground',
			outline: 'text-accent-foreground',
			destructive: 'text-destructive-foreground',
			minimal: 'text-muted-foreground',
			muted: 'text-muted-foreground',
			ghost: 'text-muted-foreground',
			link: 'text-primary-foreground underline-offset-4',
			tab: '',
		},
		position: {
			start: '',
			end: '',
		},
		size: {
			xs: 'h-3 w-3',
			sm: 'h-4 w-4',
			md: 'h-6 w-6',
			lg: 'h-10 w-10',
			xl: 'h-12 w-12',
		},
	},
	compoundVariants: [
		{
			variant: 'button',
			position: 'start',
			className: 'ltr:-mr-2 rtl:-ml-2',
		},
		{
			variant: 'button',
			position: 'end',
			className: 'ltr:-ml-2 rtl:-mr-2',
		},
	],
});

export { buttonVariants, buttonIconVariants, type ButtonVariants };
