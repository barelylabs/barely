import * as React from 'react';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';
import { Preview } from '@react-email/preview';
import { Text } from '@react-email/text';

import { EmailFooter } from '../components/email-footer';
import { EmailHeaderLogo } from '../components/email-header-logo';
import {
	Body,
	EmailButton,
	EmailContainer,
	EmailHeading,
	EmailSeparator,
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
					{props.firstName && <Text>Hi {props.firstName},</Text>}
					<Text>
						Our A&R team has reviewed{' '}
						<span className='font-bold'>"{props.trackName}"</span> and it sounds good to
						proceed!
					</Text>

					<Text>{props.screeningMessage}</Text>

					<Text className='text-md'>
						Click the button below to go to your account, set up budget, and launch your
						playlist.pitch campaign.
					</Text>
					<EmailButton href={props.loginLink}>Start my campaign 🚀</EmailButton>

					<EmailSeparator />

					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};

export { PlaylistPitchApprovedEmailTemplate };
