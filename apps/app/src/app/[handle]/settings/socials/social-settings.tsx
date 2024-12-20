'use client';

import type { z } from 'zod';
import { useUpdateWorkspace } from '@barely/lib/hooks/use-update-workspace';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
// import { useWorkspaceUpdateForm } from '@barely/lib/hooks/use-workspace-update-form';
import { useZodForm } from '@barely/lib/hooks/use-zod-form';
import { updateWorkspaceSchema } from '@barely/lib/server/routes/workspace/workspace.schema';
import {
	isValidUrl,
	parseInstagramLink,
	parseTikTokLink,
	parseYoutubeLink,
} from '@barely/lib/utils/link';
import { parseSpotifyUrl } from '@barely/lib/utils/spotify';

import { SettingsCardForm } from '@barely/ui/components/settings-card';
import { NumberField } from '@barely/ui/forms/number-field';
import { TextField } from '@barely/ui/forms/text-field';

export function SocialStatsForm() {
	const { workspace } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			facebookFollowers: workspace.facebookFollowers,
			instagramFollowers: workspace.instagramFollowers,
			spotifyFollowers: workspace.spotifyFollowers,
			spotifyMonthlyListeners: workspace.spotifyMonthlyListeners,
			twitterFollowers: workspace.twitterFollowers,
			youtubeSubscribers: workspace.youtubeSubscribers,
		},
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

	return (
		<SettingsCardForm
			form={form}
			onSubmit={onSubmit}
			title='Social Stats'
			subtitle='Update your social stats. *This is temporary until we check these stats for you*'
			disableSubmit={!form.formState.isDirty}
			formHint='Please enter your social stats.'
		>
			<TextField
				label='Facebook Followers'
				control={form.control}
				type='number'
				name='facebookFollowers'
			/>
			<TextField
				label='Instagram Followers'
				control={form.control}
				type='number'
				name='instagramFollowers'
			/>
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
				label='Twitter Followers'
				control={form.control}
				type='number'
				name='twitterFollowers'
			/>
			<TextField
				label='YouTube Subscribers'
				control={form.control}
				type='number'
				name='youtubeSubscribers'
			/>
		</SettingsCardForm>
	);
}

export function SocialLinksForm() {
	const { workspace } = useWorkspace();

	const form = useZodForm({
		schema: updateWorkspaceSchema,
		values: {
			id: workspace.id,
			spotifyArtistId: workspace.spotifyArtistId,
			youtubeChannelId: workspace.youtubeChannelId,
			tiktokUsername: workspace.tiktokUsername,
			instagramUsername: workspace.instagramUsername,
			website: workspace.website,
		},
	});

	const { updateWorkspace } = useUpdateWorkspace({
		onSuccess: () => form.reset(),
	});

	const onSubmit = async (data: z.infer<typeof updateWorkspaceSchema>) => {
		await updateWorkspace(data);
	};

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
					const parsedSpotifyLink = parseSpotifyUrl(input);
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
