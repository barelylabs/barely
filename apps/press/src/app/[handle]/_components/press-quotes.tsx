import type { PublicPressKit } from '@barely/validators';

import { Section, SectionDiv } from '~/app/[handle]/_components/press-section';

export function PressQuotes({
	pressQuotes,
}: {
	pressQuotes: NonNullable<PublicPressKit['pressQuotes']>;
}) {
	return (
		<Section id='press-quotes'>
			<SectionDiv title='Press Quotes'>
				<div className='flex flex-col gap-6'>
					{pressQuotes.map((q, index) => (
						<PressQuote key={index} quote={q} />
					))}
				</div>
			</SectionDiv>
		</Section>
	);
}

function PressQuote({
	quote,
}: {
	quote: NonNullable<PublicPressKit['pressQuotes']>[number];
}) {
	return (
		<p className='text-left text-lg leading-tight'>
			&quot;{quote.quote}&quot; -{' '}
			<span className='italic'>
				{quote.link ?
					<a
						target='_blank'
						rel='noopener noreferrer'
						href={quote.link}
						className='hover:underline'
					>
						{quote.source}
					</a>
				:	<>{quote.source}</>}
			</span>
		</p>
	);
}
