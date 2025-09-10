import * as React from 'react';
import { Head, Html, Preview, Text } from '@react-email/components';

import { EmailFooter } from '../../components/email-footer';
import { EmailHeaderLogo } from '../../components/email-header-logo';
import {
	Body,
	EmailButton,
	EmailContainer,
	EmailHeading,
	EmailLink,
	EmailSeparator,
} from '../../primitives';

interface WorkspaceRegistrationInviteEmailProps {
	inviterName: string;
	workspaceName: string;
	registrationLink: string;
}

export const WorkspaceRegistrationInviteEmailTemplate = ({
	inviterName,
	workspaceName,
	registrationLink,
}: WorkspaceRegistrationInviteEmailProps) => {
	const previewText = `You've been invited to join ${workspaceName} on barely.ai`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>You've been invited to join {workspaceName}</EmailHeading>

					<Text>
						{inviterName} has invited you to join the workspace{' '}
						<strong>{workspaceName}</strong> on barely.ai.
					</Text>

					<Text>
						To accept this invitation, you'll need to create a free{' '}
						<span>
							<EmailLink href='https://barely.ai'>barely.ai</EmailLink>
						</span>{' '}
						account. Click the button below to get started and automatically join the
						workspace.
					</Text>

					<EmailButton href={registrationLink}>Create Account & Join</EmailButton>

					<EmailSeparator />

					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};

WorkspaceRegistrationInviteEmailTemplate.PreviewProps = {
	inviterName: 'Paul',
	workspaceName: 'The Beatles',
	registrationLink: 'https://app.barely.ai/register?inviteToken=invt_1234567890',
} satisfies WorkspaceRegistrationInviteEmailProps;

export default WorkspaceRegistrationInviteEmailTemplate;
