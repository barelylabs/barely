import * as React from 'react';

import { EmailFooter } from '../components/email-footer';
import { EmailHeaderLogo } from '../components/email-header-logo';
import {
	Body,
	EmailButton,
	EmailContainer,
	EmailHeading,
	EmailQuote,
	EmailSeparator,
	EmailText,
	Head,
	Html,
	Preview,
} from '../primitives';

const PlaylistPitchApprovedEmailTemplate = (props: {
	firstName?: string;
	loginLink: string;
	trackName: string;
	screeningMessage: string;
}) => {
	const previewText = `Launch your playlist.pitch campaign!`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>Your track is accepted!</EmailHeading>
					{props.firstName && <EmailText>Hi {props.firstName},</EmailText>}
					<EmailText>
						Our A&R team has reviewed{' '}
						<span className='font-bold'>"{props.trackName}"</span> and it sounds good to
						proceed!
					</EmailText>

					<EmailQuote>{props.screeningMessage}</EmailQuote>

					<EmailText className='text-md'>
						Click the button below to go to your account, set up budget, and launch your
						playlist.pitch campaign.
					</EmailText>
					<EmailButton href={props.loginLink}>Start my campaign 🚀</EmailButton>

					<EmailSeparator />

					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};

export { PlaylistPitchApprovedEmailTemplate };
