import { cn } from '@barely/utils';

interface ValueCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	className?: string;
}

export function ValueCard({ icon, title, description, className }: ValueCardProps) {
	return (
		<div
			className={cn(
				'group relative overflow-hidden rounded-2xl p-8',
				'glass border border-white/10',
				'transition-all duration-300 hover:border-white/20',
				className,
			)}
		>
			{/* Gradient overlay on hover */}
			<div className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
				<div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10' />
			</div>

			{/* Content */}
			<div className='relative z-10'>
				<div className='mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary'>
					{icon}
				</div>
				<h3 className='mb-3 text-xl font-semibold text-white'>{title}</h3>
				<p className='text-muted-foreground'>{description}</p>
			</div>
		</div>
	);
}
