import { getAbsoluteUrl } from '@barely/utils';

export function PoweredByBarelyFooter() {
	return (
		<div className='mt-16'>
			<p className='text-center text-xs text-muted-foreground'>
				Powered by{' '}
				<a
					href={getAbsoluteUrl('www')}
					target='_blank'
					rel='noopener noreferrer'
					className='transition-colors hover:text-foreground'
				>
					Barely
				</a>{' '}
				© 2025
			</p>
		</div>
	);
}
