import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import {
	SocialLinksForm,
	SocialStatsForm,
} from '~/app/[handle]/settings/socials/social-settings';

export default function SocialsPage() {
	return (
		<>
			<DashContentHeader title='Socials' subtitle='Update your socials.' />
			<DashContent>
				<SocialLinksForm />
				<SocialStatsForm />
			</DashContent>
		</>
	);
}
