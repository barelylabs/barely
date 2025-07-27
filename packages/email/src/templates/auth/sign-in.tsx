import * as React from 'react';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';
import { Preview } from '@react-email/preview';
import { Text } from '@react-email/text';

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

interface SignInEmailTemplateProps {
	firstName?: string;
	loginLink: string;
}

export const SignInEmailTemplate = (props: SignInEmailTemplateProps) => {
	const previewText = `Sign in to your barely.ai account`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body>
				<EmailContainer>
					<EmailHeaderLogo />
					<EmailHeading>Your login link</EmailHeading>
					{props.firstName && <p>Hi {props.firstName},</p>}
					<Text>
						Please click the button below to sign in to your{' '}
						<span>
							<EmailLink href='https://barely.ai'>barely.ai</EmailLink>
						</span>{' '}
						account.
					</Text>
					<EmailButton href={props.loginLink}>Login to barely.ai</EmailButton>

					<EmailSeparator />

					<EmailFooter />
				</EmailContainer>
			</Body>
		</Html>
	);
};

SignInEmailTemplate.PreviewProps = {
	firstName: 'John',
	loginLink: 'https://app.barely.ai/login',
} satisfies SignInEmailTemplateProps;

export default SignInEmailTemplate;
