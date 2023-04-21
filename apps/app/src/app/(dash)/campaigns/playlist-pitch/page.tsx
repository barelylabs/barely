import { DashContentHeader } from '~/app/(dash)/components/dash-content-header';
import { PlaylistPitchSubmissionForm } from '~/app/(public)/playlist-pitch/playlist-pitch-form';

export default function Page() {
	return (
		<>
			<DashContentHeader title='playlist.pitch' />
			<PlaylistPitchSubmissionForm />
		</>
	);
}
