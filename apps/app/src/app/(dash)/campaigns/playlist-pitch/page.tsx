import { PlaylistPitchSubmissionForm } from '~/app/(dash)/campaigns/playlist-pitch/playlist-pitch-form';
import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';

export default function Page() {
	return (
		<>
			<DashContentHeader title='playlist.pitch' />
			<PlaylistPitchSubmissionForm />
		</>
	);
}
