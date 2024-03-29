import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressContact({
	heading,
	contactName,
	email,
}: {
	heading?: string | null;
	contactName?: string | null;
	email: string;
}) {
	return (
		<Section id='contact'>
			<SectionDiv title='Contact'>
				<p className='text-left text-md leading-8'>
					<span className='font-semibold'>{heading ?? 'Booking'}</span>
					<br />

					{contactName && (
						<>
							{contactName}
							<br />
						</>
					)}

					<a href={`mailto:${email}`}>{email}</a>
				</p>
			</SectionDiv>
		</Section>
	);
}
