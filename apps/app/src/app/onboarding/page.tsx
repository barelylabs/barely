import { NewWorkspaceModalForOnboarding } from '../[handle]/_components/new-workspace-modal';

export default function OnboardingPage() {
	return (
		<div className='flex min-h-screen items-center justify-center p-4'>
			<div className='text-center'>
				<h1 className='mb-4 text-2xl font-bold'>Welcome to Barely!</h1>
				<p className='mb-8 text-muted-foreground'>
					Workspace completed. Redirecting to dashboard...
				</p>
				<NewWorkspaceModalForOnboarding />
			</div>
		</div>
	);
}
