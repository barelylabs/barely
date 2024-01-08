import { Button } from '@barely/ui/elements/button';
import { Card } from '@barely/ui/elements/card';
import { Text, Title } from '@barely/ui/elements/typography';

const LetsGetStarted = () => {
	return (
		<Card className='p-6 sm:p-8 mt-24'>
			<div className='grid grid-cols-1 sm:grid-flow-col gap-4 items-center'>
				<div className='flex flex-col space-y-4 flex-grow'>
					<Title>Let&apos;s get started</Title>
					<Text variant='xl/normal' muted>
						Create your first campaign, and we&apos;ll get to work matching you with the
						perfect playlists!
					</Text>
				</div>

				<div className='flex-grow-0 w-full sm:w-fit sm:pl-20 pt-4 sm:pt-0'>
					<Button size='lg' pill fullWidth href='https://app.barely.io/playlist-pitch'>
						Create my campaign 🚀
					</Button>
				</div>
			</div>
		</Card>
	);
};

const GetStartedToday = () => {
	return (
		<div className='flex flex-col max-w-2xl space-y-4 mt-20 items-center text-left'>
			<Title>Get started today</Title>
			<Text variant='xl/normal' muted className='pb-2'>
				Submit your track in under 2 minutes.
			</Text>

			<div className='w-full sm:w-fit'>
			<Button size='lg' pill fullWidth href='https://app.barely.io/playlist-pitch'>
				Start campaign 🚀
			</Button>
			</div>
		</div>
	);
};

export { LetsGetStarted, GetStartedToday };
