'use client';

import type { BioWithButtons } from '@barely/validators';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Avatar } from '@barely/ui/avatar';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { Text } from '@barely/ui/typography';

import { BioButtonList } from './bio-button-list';
import { ProfileEditModal } from './profile-edit-modal';
import { SocialIconsModal } from './social-icons-modal';

export function BioButtonsSection() {
	const params = useParams();
	const handle = params.handle as string;
	const trpc = useTRPC();
	const [showProfileModal, setShowProfileModal] = useState(false);
	const [showSocialModal, setShowSocialModal] = useState(false);

	// Get the workspace's bio
	const { data: bio, isLoading } = useQuery({
		...trpc.bio.byHandle.queryOptions({ handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	}) as { data: BioWithButtons | undefined; isLoading: boolean };

	if (isLoading) {
		return (
			<Card className='p-6'>
				<div className='flex items-center justify-center'>
					<LoadingSpinner />
				</div>
			</Card>
		);
	}

	if (!bio) {
		return (
			<Card className='p-6'>
				<Text variant='lg/semibold'>Bio not found</Text>
				<Text variant='sm/normal' className='text-muted-foreground'>
					Unable to load bio configuration.
				</Text>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Profile Summary Card */}
			<Card className='p-6'>
				<div className='flex items-center gap-4'>
					{/* Avatar */}
					{(() => {
						const avatarImage = bio.workspace?._avatarImages?.[0]?.file;
						return (
							<Avatar
								className='h-16 w-16'
								imageWidth={64}
								imageHeight={64}
								imageUrl={
									avatarImage?.s3Key ? undefined : (bio.workspace?.imageUrl ?? undefined)
								}
								imageS3Key={avatarImage?.s3Key}
								imageBlurDataUrl={avatarImage?.blurDataUrl ?? undefined}
							/>
						);
					})()}

					{/* Profile Info */}
					<div className='flex-1'>
						<div className='flex items-start justify-between'>
							<div>
								<Text variant='lg/semibold'>{bio.title ?? bio.handle}</Text>
								{bio.subtitle && (
									<Text variant='sm/normal' className='mt-1 text-muted-foreground'>
										{bio.subtitle}
									</Text>
								)}
							</div>

							{/* Edit Button */}
							<Button
								size='sm'
								look='outline'
								startIcon='edit'
								onClick={() => setShowProfileModal(true)}
							>
								Edit
							</Button>
						</div>

						{/* Social Icons - placeholder for now */}
						<div className='mt-3 flex items-center gap-2'>
							{/* Add social button */}
							<button
								onClick={() => setShowSocialModal(true)}
								className='flex h-4 w-4 items-center justify-center rounded-full border-2 border-muted-foreground/50 transition-colors hover:border-muted-foreground hover:bg-muted'
							>
								<Icon.add className='h-3 w-3 text-muted-foreground' />
							</button>
							<Text variant='xs/normal' className='text-muted-foreground'>
								Add social icons
							</Text>
						</div>
					</div>
				</div>
			</Card>

			{/* Buttons List */}
			<Card className='p-6'>
				<BioButtonList
					bioId={bio.id}
					handle={handle}
					buttons={bio.buttons}
					editable={true}
				/>
			</Card>

			{/* Modals */}
			<ProfileEditModal
				open={showProfileModal}
				onOpenChange={setShowProfileModal}
				bio={bio}
				handle={handle}
			/>

			<SocialIconsModal
				open={showSocialModal}
				onOpenChange={setShowSocialModal}
				bio={bio}
				handle={handle}
			/>
		</div>
	);
}
