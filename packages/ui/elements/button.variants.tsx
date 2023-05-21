import { cva } from 'class-variance-authority';

const buttonVariants = cva(
	'active:scale-95 inline-flex w-fit items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ',
	{
		variants: {
			// variant: {
			// 	solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
			// 	secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
			// 	go: 'bg-spotify-500 text-white hover:bg-spotify-600 dark:hover:bg-spotify-600',
			// 	destructive: 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600',
			// 	outline:
			// 		'border-[1.5px] border-input bg-transparent hover:bg-accent hover:text-accent-foreground ',
			// 	subtle:
			// 		'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100',
			// 	ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
			// 	link: 'bg-transparent underline-offset-4 hover:underline text-primary',
			// },

			variant: {
				primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				success: 'bg-success text-success-foreground hover:bg-success/80',
				destructive: 'bg-destructive text-destructive hover:bg-destructive/90',
				outline:
					'border-[1.5px] border-input bg-transparent hover:bg-accent hover:text-accent-foreground ',
				muted: 'bg-muted text-muted-foreground hover:bg-muted/90',
				subtle: 'bg-transparent hover:text-secondary-foreground/70',
				ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
				link: 'bg-transparent underline-offset-4 hover:underline text-primary',
			},

			// fullWidth: {
			// 	true: 'w-full',
			// },
			// minWidth: {
			// 	true: 'max-w-fit',
			// },
			size: {
				sm: 'h-9 px-2 rounded-md text-sm',
				md: 'h-10 py-2 px-4 text-sm md:text-md',
				lg: 'h-11 py-4 px-6 md:py-6 md:px-8 rounded-md text-md md:text-lg',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
		},
	},
);

type ButtonVariants = typeof buttonVariants;

export { buttonVariants, type ButtonVariants };
