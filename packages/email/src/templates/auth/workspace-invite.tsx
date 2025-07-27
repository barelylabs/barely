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
	const previewText = `You've been invited to barely.ai`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>You've been invited to a workspace on barely.ai</EmailHeading>

					<Text>
						{inviterName} has invited you to join the workspace{' '}
						<strong>{workspaceName}</strong> on barely.ai. Please click the button below
						to sign in to your{' '}
						<span>
							<EmailLink href='https://barely.ai'>barely.ai</EmailLink>
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
	loginLink: 'https://app.barely.ai/login',
} satisfies WorkspaceInviteEmailProps;

export default WorkspaceInviteEmailTemplate;
