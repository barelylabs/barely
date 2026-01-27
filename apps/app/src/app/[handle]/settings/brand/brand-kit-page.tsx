'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { MDXEditorMethods } from '@barely/ui/mdx-editor';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@barely/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@barely/ui/tabs';
import { Text } from '@barely/ui/typography';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { AppBioRender } from '~/app/[handle]/bios/_components/app-bio-render';
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
	const [previewTab, setPreviewTab] = useState('bio');
	const [selectedBioKey, setSelectedBioKey] = useState('home');
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

	// Fetch all bio pages for the workspace
	const { data: bioPages } = useSuspenseQuery(
		trpc.bio.byWorkspace.queryOptions(
			{ handle },
			{
				staleTime: 1000 * 60 * 5, // 5 minutes
			},
		),
	);

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
				<div className='flex h-full flex-col gap-6 lg:flex-row'>
					{/* Main content - Left side on large screens */}
					<div className='order-1 h-full flex-1 space-y-6 overflow-y-auto'>
						<BrandKitFormContent
							form={form}
							mdxEditorRef={mdxEditorRef as React.RefObject<MDXEditorMethods>}
						/>
						{/* <div className='flex max-w-20 flex-col gap-2'>
							<pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
						</div> */}
					</div>

					{/* Desktop Preview - Right side on large screens */}
					<div className='order-2 hidden w-full max-w-sm lg:block'>
						<div className='sticky top-6'>
							<div className='mb-4 flex flex-col items-center justify-between gap-4'>
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

								{/* Bio page selector */}
								{previewTab === 'bio' && bioPages.bios.length > 0 && (
									<Select value={selectedBioKey} onValueChange={setSelectedBioKey}>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Select a bio page' />
										</SelectTrigger>
										<SelectContent>
											{bioPages.bios.map(bioPage => (
												<SelectItem key={bioPage.key} value={bioPage.key}>
													{bioPage.key === 'home' ? 'Home' : bioPage.key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>

							<div className='relative overflow-hidden rounded-lg'>
								{previewTab === 'bio' && <BioPreview bio={bio} bioKey={selectedBioKey} />}
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
	bio, 
	bioKey 
}: { 
	bio: AppRouterOutputs['bio']['byKey'];
	bioKey: string;
}) {
	return (
		<div className='flex flex-col items-center gap-4'>
			<span className='text-sm text-muted-foreground'>barely.bio/{bio.handle}</span>
			<AppBioRender bioKey={bioKey} />
		</div>
	);
}
