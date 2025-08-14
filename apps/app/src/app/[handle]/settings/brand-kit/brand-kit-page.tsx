'use client';

import type { BioWithBlocks, BrandKit } from '@barely/validators';
import type { z } from 'zod/v4';
import { Suspense, useRef, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { updateBrandKitSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { BioRenderV2 } from '@barely/ui/bio';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { LoadingSpinner } from '@barely/ui/loading';
import { Tabs, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { useBrandKit } from '~/hooks/use-brand-kit';
import { BrandKitFormContent } from './brand-kit-form-content';

export function BrandKitPage() {
	return (
		<NavigationGuardProvider>
			<Suspense
				fallback={
					<div className='flex min-h-[400px] items-center justify-center'>
						<LoadingSpinner />
					</div>
				}
			>
				<BrandKitPageInner />
			</Suspense>
		</NavigationGuardProvider>
	);
}

function BrandKitPageInner() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const { handle } = useWorkspace();
	const { brandKit } = useBrandKit(); // Now brandKit is guaranteed to be defined
	const [previewTab, setPreviewTab] = useState('bio');
	const mdxEditorRef = useRef<any>(null);

	// Initialize form with brand kit data (brandKit is guaranteed to be defined with suspense)
	const formSchema = updateBrandKitSchema;
	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			id: brandKit.id,
			longBio: brandKit.longBio ?? '',
			shortBio: brandKit.shortBio ?? '',
			location: brandKit.location ?? '',
			appearancePreset: brandKit.appearancePreset || undefined,
			colorScheme: brandKit.colorScheme || undefined,
			fontPreset: brandKit.fontPreset || 'modern.cal',
			headingFont: brandKit.headingFont || undefined,
			bodyFont: brandKit.bodyFont || undefined,
			blockStyle: brandKit.blockStyle || 'rounded',
			blockShadow: brandKit.blockShadow ?? false,
			blockOutline: brandKit.blockOutline ?? false,
		},
	});

	// Set up mutation
	const updateMutation = useMutation({
		...trpc.brandKit.update.mutationOptions(),
		onSuccess: data => {
			toast.success('Brand kit updated successfully');
			void queryClient.invalidateQueries({
				queryKey: trpc.brandKit.current.queryKey(),
			});
			// Reset form with the updated values to clear dirty state
			form.reset({
				id: data.id,
				longBio: data.longBio ?? '',
				shortBio: data.shortBio ?? '',
				location: data.location ?? '',
				appearancePreset: data.appearancePreset || undefined,
				colorScheme: data.colorScheme || undefined,
				fontPreset: data.fontPreset || 'modern.cal',
				headingFont: data.headingFont || undefined,
				bodyFont: data.bodyFont || undefined,
				blockStyle: data.blockStyle || 'rounded',
				blockShadow: data.blockShadow ?? false,
				blockOutline: data.blockOutline ?? false,
			});
		},
		onError: error => {
			toast.error(error.message ?? 'Failed to update brand kit');
		},
	});

	const handleSubmit = (data: z.infer<typeof formSchema>) => {
		console.log('Submitting brand kit data:', data);
		console.log('Data type:', typeof data);
		console.log('Data keys:', Object.keys(data));
		updateMutation.mutate({ ...data, handle });
	};

	// Set up navigation guard for unsaved changes
	useNavigationGuard({
		enabled: form.formState.isDirty && !updateMutation.isPending,
		confirm: () => {
			return window.confirm('You have unsaved changes. Are you sure you want to leave?');
		},
	});

	// Fetch the actual bio for this workspace (also using suspense)
	const { data: bio } = useSuspenseQuery({
		...trpc.bio.byHandleWithBlocks.queryOptions({ handle }),
		staleTime: 1000 * 60 * 5, // 5 minutes
	}) as { data: BioWithBlocks | undefined };

	// Watch form values for live preview
	const formValues = form.watch();
	// Also specifically watch colorScheme to ensure updates trigger re-render
	const colorScheme = form.watch('colorScheme');

	// Merge brand kit data with live form data for preview
	const previewData = { ...brandKit, ...formValues, colorScheme };

	const submitDisabled = !form.formState.isDirty;
	return (
		<Form form={form} onSubmit={handleSubmit}>
			<DashContentHeader
				title='Brand Kit'
				subtitle='Define your brand once, apply it everywhere'
				button={
					<SubmitButton disabled={submitDisabled} loading={updateMutation.isPending}>
						Save Changes
					</SubmitButton>
				}
			/>
			<DashContent>
				{/* <SubmitButton loading={updateMutation.isPending}>Save Changes</SubmitButton> */}
				<div className='flex h-full flex-col gap-6 lg:flex-row'>
					{/* Main content - Left side on large screens */}
					<div className='order-1 h-full flex-1 space-y-6 overflow-y-auto'>
						<BrandKitFormContent form={form} mdxEditorRef={mdxEditorRef} />
						<div className='flex max-w-20 flex-col gap-2'>
							<pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
						</div>
					</div>

					{/* Desktop Preview - Right side on large screens */}
					<div className='order-2 hidden w-full max-w-sm lg:block'>
						<div className='sticky top-6'>
							<div className='mb-4 flex flex-col items-center justify-between'>
								{/* <h3 className='text-lg font-semibold'>Live Preview</h3> */}
								<Tabs value={previewTab} onValueChange={setPreviewTab}>
									<TabsList>
										<TabsTrigger value='bio'>Bio</TabsTrigger>
										<TabsTrigger value='page' disabled>
											Page
										</TabsTrigger>
										<TabsTrigger value='cart' disabled>
											Cart
										</TabsTrigger>
										<TabsTrigger value='fm' disabled>
											FM
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>

							<div className='relative overflow-hidden rounded-lg'>
								{previewTab === 'bio' && (
									<BioPreview
										brandKit={previewData}
										bio={bio}
										shortBio={formValues.shortBio}
									/>
								)}
								{previewTab === 'page' && (
									<div className='flex h-[600px] items-center justify-center bg-muted'>
										<Text variant='sm/normal' className='text-muted-foreground'>
											Page preview coming soon
										</Text>
									</div>
								)}
								{previewTab === 'cart' && (
									<div className='flex h-[600px] items-center justify-center bg-muted'>
										<Text variant='sm/normal' className='text-muted-foreground'>
											Cart preview coming soon
										</Text>
									</div>
								)}
								{previewTab === 'fm' && (
									<div className='flex h-[600px] items-center justify-center bg-muted'>
										<Text variant='sm/normal' className='text-muted-foreground'>
											FM preview coming soon
										</Text>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</DashContent>
		</Form>
	);
}

// Preview component for bio using brand kit
function BioPreview({
	brandKit,
	bio,
	shortBio,
}: {
	brandKit: BrandKit;
	bio?: BioWithBlocks;
	shortBio?: string | null;
}) {
	// Use actual bio data if available, otherwise use mock data
	const bioData: BioWithBlocks =
		bio ??
		({
			id: 'preview',
			handle: 'preview',
			key: 'home',
			workspaceId: 'preview',
			deletedAt: null,
			archivedAt: null,
			imgShape: null,
			socialDisplay: true,
			showLocation: false,
			headerStyle: 'minimal',
			blockShadow: false,
			showHeader: true,
			workspace: {
				id: 'preview',
				name: 'Your Brand',
				imageUrl: null,
				brandKit: {
					...brandKit,
					shortBio: shortBio ?? brandKit.shortBio,
				},
			},
			blocks: [
				{
					id: 'block-1',
					workspaceId: 'preview',
					type: 'links' as const,
					name: null,
					title: null,
					subtitle: null,
					enabled: true,
					lexoRank: 'a',
					deletedAt: null,
					archivedAt: null,
					settings: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					links: [
						{
							id: 'link-1',
							blockId: 'block-1',
							text: 'Latest Release',
							url: '#',
							enabled: true,
							target: null,
							lexoRank: 'a',
						},
						{
							id: 'link-2',
							blockId: 'block-1',
							text: 'Tour Dates',
							url: '#',
							enabled: true,
							target: null,
							lexoRank: 'b',
						},
						{
							id: 'link-3',
							blockId: 'block-1',
							text: 'Merch Store',
							url: '#',
							enabled: true,
							target: null,
							lexoRank: 'c',
						},
					],
				},
			],
			barelyBranding: true,
			showShareButton: true,
			showSubscribeButton: false,
			emailCaptureEnabled: false,
			emailCaptureIncentiveText: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as unknown as BioWithBlocks);

	// Override shortBio in workspace.brandKit if provided
	const bioWithShortBio: BioWithBlocks =
		bio && bio.workspace ?
			({
				...bio,
				workspace: {
					...bio.workspace,
					brandKit: {
						...bio.workspace.brandKit,
						...brandKit,
						shortBio: shortBio ?? brandKit.shortBio,
					},
				},
			} as unknown as BioWithBlocks)
		:	bioData;

	return (
		<div className='flex flex-col items-center gap-4'>
			<span className='text-sm text-muted-foreground'>barely.bio/{bio?.handle}</span>
			<BioRenderV2
				bio={bioWithShortBio}
				// Pass brand kit properties as separate props
				themeKey={brandKit.themeKey}
				headerStyle={bio?.headerStyle ?? 'minimal'}
				appearancePreset={brandKit.appearancePreset}
				colorScheme={
					typeof brandKit.colorScheme === 'string' ? brandKit.colorScheme
					: brandKit.colorScheme ?
						JSON.stringify(brandKit.colorScheme)
					:	null
				}
				fontPreset={brandKit.fontPreset}
				headingFont={brandKit.headingFont}
				bodyFont={brandKit.bodyFont}
				blockStyle={brandKit.blockStyle}
				blockShadow={brandKit.blockShadow}
				blockOutline={brandKit.blockOutline}
				// Preview settings
				isPreview={true}
				enableAnalytics={false}
				showPhoneFrame={true}
				showShareButton={false}
				showSubscribeButton={false}
				// No callbacks in preview mode - links are not interactive
				onLinkClick={undefined}
				onEmailCapture={undefined}
				onPageView={undefined}
			/>
		</div>
	);
}
