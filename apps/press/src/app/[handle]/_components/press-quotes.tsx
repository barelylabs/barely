import type { PublicPressKit } from '@barely/lib/server/press-kit.schema';

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
					{pressQuotes?.map((q, index) => <PressQuote key={index} quote={q} />)}
					{/* <p className="text-left text-md">
            Praise for their debut album <i>So Close to Paradise</i>:
          </p>
          <p className="text-left text-md leading-tight">
            &quot;Appealing vocals over infectious guitar lines and compelling
            rhythm, with loveable sax arrangements and anthemic vibes.&quot; -
            Velvety
          </p>
          <p className="text-left text-md leading-tight">
            &quot;Really nice vocal tones - there&apos;s something intoxicating
            about their music.&quot; - B-sides and Badlands
          </p>
          <p className="text-left text-md leading-tight">
            &quot;Heartfelt, rich and alluring... [their music] smolders with
            emotion as it gently grooves through a world of lush atmospheric
            tones.&quot; - Barry Gruff
          </p> */}
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
				{quote.link ? <a href={quote.link}>{quote.quote}</a> : <>{quote.source}</>}
			</span>
		</p>
	);
}
