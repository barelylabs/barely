'use client';

import { useWorkspaceUpdateForm } from '@barely/lib/hooks/use-workspace-update-form';
import {
	isValidUrl,
	parseInstagramLink,
	parseSpotifyLink,
	parseTikTokLink,
	parseYoutubeLink,
} from '@barely/lib/utils/link';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { NumberField } from '@barely/ui/forms/number-field';
import { TextField } from '@barely/ui/forms/text-field';

export function SocialStatsForm() {
	const { form, onSubmit } = useWorkspaceUpdateForm();

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Social Stats'
			subtitle='Update your social stats. *This is temporary until we check these stats for you*'
			disableSubmit={!form.formState.isDirty}
			formHint='Please enter your social stats.'
		>
			<NumberField
				label='Spotify Followers'
				control={form.control}
				name='spotifyFollowers'
			/>
			<TextField
				label='Spotify Monthly Listeners'
				control={form.control}
				type='number'
				name='spotifyMonthlyListeners'
			/>
			<TextField
				label='YouTube Subscribers'
				control={form.control}
				type='number'
				name='youtubeSubscribers'
			/>
			<TextField
				label='Instagram Followers'
				control={form.control}
				type='number'
				name='instagramFollowers'
			/>
			<TextField
				label='Twitter Followers'
				control={form.control}
				type='number'
				name='twitterFollowers'
			/>
			<TextField
				label='Facebook Followers'
				control={form.control}
				type='number'
				name='facebookFollowers'
			/>
			<TextField
				label='Instagram Followers'
				control={form.control}
				name='instagramFollowers'
				type='number'
			/>
		</SettingsCardForm>
	);
}

export function SocialLinksForm() {
	const { form, onSubmit } = useWorkspaceUpdateForm();

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Social Links'
			subtitle='Update your social links.'
			disableSubmit={!form.formState.isDirty}
			formHint='Please enter your social links.'
		>
			<TextField
				label='Spotify Artist ID'
				control={form.control}
				name='spotifyArtistId'
				onPaste={e => {
					const input = e.clipboardData.getData('text');
					if (!input || !isValidUrl(input)) return;
					const parsedSpotifyLink = parseSpotifyLink(input);
					if (!parsedSpotifyLink || parsedSpotifyLink.type !== 'artist') return;
					e.preventDefault();
					form.setValue('spotifyArtistId', parsedSpotifyLink.id, { shouldDirty: true });
				}}
			/>
			<TextField
				label='YouTube Channel ID'
				control={form.control}
				name='youtubeChannelId'
				onPaste={e => {
					const input = e.clipboardData.getData('text');
					if (!input || !isValidUrl(input)) return;
					const parsedYoutubeLink = parseYoutubeLink(input);
					if (!parsedYoutubeLink || parsedYoutubeLink.type !== 'channel') return;
					e.preventDefault();
					form.setValue('youtubeChannelId', parsedYoutubeLink.id, { shouldDirty: true });
				}}
			/>
			<TextField
				label='TikTok Username'
				control={form.control}
				name='tiktokUsername'
				onPaste={e => {
					const input = e.clipboardData.getData('text');
					if (!input || !isValidUrl(input)) return;
					const parsedTikTokLink = parseTikTokLink(input);
					if (!parsedTikTokLink) return;
					e.preventDefault();
					form.setValue('tiktokUsername', parsedTikTokLink.username, {
						shouldDirty: true,
					});
				}}
			/>
			<TextField
				label='Instagram Username'
				control={form.control}
				name='instagramUsername'
				onPaste={e => {
					const input = e.clipboardData.getData('text');
					if (!input || !isValidUrl(input)) return;
					const parsedInstagramLink = parseInstagramLink(input);
					if (!parsedInstagramLink) return;
					e.preventDefault();
					form.setValue('instagramUsername', parsedInstagramLink.username, {
						shouldDirty: true,
					});
				}}
			/>
			<TextField label='Website' control={form.control} name='website' />
		</SettingsCardForm>
	);
}
