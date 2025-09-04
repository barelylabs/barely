import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioContactFormPage } from '../../_components/bio-contact-form-page';

export default async function ContactFormPage({
	searchParams,
}: {
	searchParams: Promise<{ blockId: string }>;
}) {
	const awaitedSearchParams = await searchParams;
	const blockId = awaitedSearchParams.blockId;

	return (
		<>
			<DashContentHeader title='Contact Form' subtitle='Customize your contact form' />
			<DashContent>
				{blockId ?
					<BioContactFormPage blockId={blockId} />
				:	<div>Please select a contact form block from the blocks page</div>}
			</DashContent>
		</>
	);
}
