import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

const LetsGetStarted = () => {
	return (
		<Card className='mt-24 p-6 sm:p-8'>
			<div className='grid grid-cols-1 items-center gap-4 sm:grid-flow-col'>
				<div className='flex flex-grow flex-col space-y-4'>
					<H size='1'>Let&apos;s get started</H>
					<Text variant='xl/normal' muted>
						Create your first campaign, and we&apos;ll get to work matching you with the
						perfect playlists!
					</Text>
				</div>

				<div className='w-full flex-grow-0 pt-4 sm:w-fit sm:pl-20 sm:pt-0'>
					<Button size='lg' pill fullWidth href='https://app.barely.ai/playlist-pitch'>
						Create my campaign 🚀
					</Button>
				</div>
			</div>
		</Card>
	);
};

const GetStartedToday = () => {
	return (
		<div className='mt-20 flex max-w-2xl flex-col items-center space-y-4 text-left'>
			<H size='1'>Get started today</H>
			<Text variant='xl/normal' muted className='pb-2'>
				Submit your track in under 2 minutes.
			</Text>

			<div className='w-full sm:w-fit'>
				<Button size='lg' pill fullWidth href='https://app.barely.ai/playlist-pitch'>
					Start campaign 🚀
				</Button>
			</div>
		</div>
	);
};

export { LetsGetStarted, GetStartedToday };
