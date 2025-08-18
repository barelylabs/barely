'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
import type { PublicBrandKit } from '@barely/validators';
import type { z } from 'zod/v4';
import { Suspense, useRef, useState } from 'react';
import { useWorkspace, useZodForm } from '@barely/hooks';
import { updateBrandKitSchema } from '@barely/validators';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { NavigationGuardProvider, useNavigationGuard } from 'next-navigation-guard';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/app.trpc.react';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { LoadingSpinner } from '@barely/ui/loading';
import { Tabs, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AppBioRender } from '~/app/[handle]/bio/_components/app-bio-render';
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
	const { brandKit } = useBrandKit(); // brandKit is guaranteed to be defined with suspense

	// Type assertion to ensure TypeScript knows brandKit is not undefined
	if (!brandKit) {
		throw new Error('BrandKit should be defined with suspense');
	}
	const [previewTab, setPreviewTab] = useState('bio');
	const mdxEditorRef = useRef<MDXEditorMethods>(null);

	// Initialize form with brand kit data (brandKit is guaranteed to be defined with suspense)
	const formSchema = updateBrandKitSchema;
	const form = useZodForm({
		schema: formSchema,
		defaultValues: {
			...brandKit,
			longBio: brandKit.longBio ?? '',
			shortBio: brandKit.shortBio ?? '',
			location: brandKit.location ?? '',
		},
	});

	// Set up mutation
	const updateMutation = useMutation(
		trpc.brandKit.update.mutationOptions({
			onSuccess: (data: AppRouterOutputs['brandKit']['update']) => {
				toast.success('Brand kit updated successfully');

				// Reset form with the updated values to clear dirty state
				form.reset({
					...data,
					longBio: data.longBio ?? '',
					shortBio: data.shortBio ?? '',
					location: data.location ?? '',
					// colorPreset: data.colorPreset,
					// colorScheme: data.colorScheme ?? undefined,
					// fontPreset: data.fontPreset,
					// headingFont: data.headingFont ?? undefined,
					// bodyFont: data.bodyFont ?? undefined,
					// blockStyle: data.blockStyle,
					// blockShadow: data.blockShadow,
					// blockOutline: data.blockOutline,
				});
			},
			onError: error => {
				toast.error(error.message);
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.brandKit.current.queryKey(),
				});
			},
		}),
	);

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
	const { data: bio } = useSuspenseQuery(
		trpc.bio.byKey.queryOptions(
			{ handle },
			{
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		),
	);

	// Watch form values for live preview
	const formValues = form.watch();

	// Merge brand kit data with live form data for preview
	const previewData: PublicBrandKit = {
		...brandKit,
		...formValues,
		// Also specifically watch colorScheme to ensure updates trigger re-render
		colorScheme: form.watch('colorScheme') ?? brandKit.colorScheme,
		// Override with specific colorScheme value
		// colorScheme,
		// Ensure required properties are never undefined
		// id: brandKit.id,
		// workspaceId: brandKit.workspaceId,
		// fontPreset: formValues.fontPreset ?? brandKit.fontPreset,
		// blockStyle: formValues.blockStyle ?? brandKit.blockStyle,
		// blockShadow: formValues.blockShadow ?? brandKit.blockShadow,
		// blockOutline: formValues.blockOutline ?? brandKit.blockOutline,
		// createdAt: brandKit.createdAt,
		// updatedAt: brandKit.updatedAt,
	};

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
						<BrandKitFormContent
							form={form}
							mdxEditorRef={mdxEditorRef as React.RefObject<MDXEditorMethods>}
						/>
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
								{previewTab === 'bio' && <BioPreview brandKit={previewData} bio={bio} />}
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
function BioPreview(props: {
	bio: AppRouterOutputs['bio']['byKey'];
	brandKit: PublicBrandKit;
}) {
	const bio = {
		...props.bio,
		brandKit: {
			...props.brandKit,
			longBio: props.brandKit.longBio ?? null,
			shortBio: props.brandKit.shortBio ?? null,
			location: props.brandKit.location ?? null,
		},
	};

	return (
		<div className='flex flex-col items-center gap-4'>
			<span className='text-sm text-muted-foreground'>barely.bio/{bio.handle}</span>
			<AppBioRender bioKey={'home'} />
			{/* <BioRender
				bio={bio}
				// Preview settings
				isPreview={true}
				enableAnalytics={false}
				showPhoneFrame={true}
				// No callbacks in preview mode - links are not interactive
				onLinkClick={undefined}
				onEmailCapture={undefined}
				onPageView={undefined}
			/> */}
		</div>
	);
}
