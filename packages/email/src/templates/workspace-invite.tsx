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
	EmailLink,
	EmailSeparator,
} from '../primitives';

interface WorkspaceInviteEmailProps {
	inviterName: string;
	workspaceName: string;
	loginLink: string;
}

export const WorkspaceInviteEmailTemplate = ({
	inviterName,
	workspaceName,
	loginLink,
}: WorkspaceInviteEmailProps) => {
	const previewText = `You've been invited to barely.io`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>You've been invited to a workspace on barely.io</EmailHeading>

					<Text>
						{inviterName} has invited you to join the workspace{' '}
						<strong>{workspaceName}</strong> on barely.io. Please click the button below
						to sign in to your{' '}
						<span>
							<EmailLink href='https://barely.io'>barely.io</EmailLink>
						</span>{' '}
						account.
					</Text>
					<EmailButton href={loginLink}>Join {workspaceName}</EmailButton>

					<EmailSeparator />

					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};

// export { WorkspaceInviteEmailTemplate as SignInEmailTemplate };

WorkspaceInviteEmailTemplate.PreviewProps = {
	inviterName: 'Paul',
	workspaceName: 'The Beatles',
	loginLink: 'https://barely.io/login',
} satisfies WorkspaceInviteEmailProps;

export default WorkspaceInviteEmailTemplate;
