export function VipDownloadSkeleton() {
	return (
		<div className='animate-pulse text-center'>
			{/* Cover Image Skeleton - matching border-4 from actual */}
			<div className='mx-auto mb-8 h-64 w-64 rounded-lg border-4 border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700 sm:h-80 sm:w-80' />

			{/* Release Info Section */}
			<div className='mb-12 space-y-4'>
				{/* Title and Artist */}
				<div>
					{/* Title Skeleton */}
					<div className='mx-auto mb-2 h-10 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-700' />
					{/* Artist Name Skeleton */}
					<div className='mx-auto h-4 w-32 rounded bg-gray-200 dark:bg-gray-700' />
				</div>

				{/* Description Skeleton */}
				<div className='mx-auto space-y-2'>
					<div className='mx-auto h-5 w-2/3 rounded bg-gray-200 dark:bg-gray-700' />
					<div className='mx-auto h-5 w-1/2 rounded bg-gray-200 dark:bg-gray-700' />
				</div>
			</div>

			{/* Form Section */}
			<div className='mx-auto mb-12 max-w-sm space-y-4'>
				{/* Email Input Skeleton */}
				<div className='h-12 rounded-md bg-gray-200 dark:bg-gray-700' />
				{/* Checkbox Skeleton */}
				<div className='mx-auto h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700' />
				{/* Submit Button Skeleton */}
				<div className='h-12 rounded-md bg-gray-200 dark:bg-gray-700' />
				{/* Privacy Notice Skeleton */}
				<div className='mx-auto h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700' />
			</div>
		</div>
	);
}
