import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { button, container, heading, main, resetText } from '../../styles';

export interface UsageWarning80EmailProps {
	resourceType: string;
	resourceLabel: string;
	currentUsage: number;
	limit: number;
	workspaceName: string;
	upgradeUrl: string;
}

export function UsageWarning80EmailTemplate({
	resourceType: _resourceType,
	resourceLabel,
	currentUsage,
	limit,
	workspaceName,
	upgradeUrl,
}: UsageWarning80EmailProps) {
	const percentage = Math.round((currentUsage / limit) * 100);
	const previewText = `You're approaching your ${resourceLabel} limit on Barely`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Main Heading */}
					<Section style={{ textAlign: 'center', marginBottom: '20px' }}>
						<Text
							style={{
								...heading,
								fontSize: '28px',
								fontWeight: 'bold',
								margin: '0 0 10px 0',
								color: '#f59e0b', // Amber for warning
							}}
						>
							Heads Up!
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0',
							}}
						>
							You&apos;re approaching your {resourceLabel.toLowerCase()} limit
						</Text>
					</Section>

					<Hr style={{ marginTop: '30px', marginBottom: '30px' }} />

					{/* Info Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#fffbeb', // Light amber background
							borderLeft: '4px solid #f59e0b',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#92400e',
								margin: '0',
								fontWeight: '500',
							}}
						>
							{percentage}% of your {resourceLabel.toLowerCase()} limit used
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#78350f',
								margin: '10px 0 0 0',
							}}
						>
							Your workspace <strong>{workspaceName}</strong> has used{' '}
							<strong>
								{currentUsage.toLocaleString()} of {limit.toLocaleString()}
							</strong>{' '}
							{resourceLabel.toLowerCase()}.
						</Text>
					</Section>

					{/* Details */}
					<Section style={{ marginBottom: '30px' }}>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#334155',
								lineHeight: '1.6',
							}}
						>
							This is a friendly reminder that you&apos;re getting close to your
							plan&apos;s {resourceLabel.toLowerCase()} limit. To avoid any interruptions
							to your workflow, consider upgrading your plan.
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '15px',
								color: '#334155',
								lineHeight: '1.6',
								marginTop: '15px',
							}}
						>
							You can continue using Barely normally until you reach your limit.
						</Text>
					</Section>

					{/* CTA Button */}
					<Section style={{ textAlign: 'center', marginBottom: '40px' }}>
						<Button
							href={upgradeUrl}
							style={{
								...button,
								backgroundColor: '#f59e0b',
								padding: '14px 40px',
							}}
						>
							View Plans
						</Button>
					</Section>

					{/* Footer */}
					<Hr style={{ marginBottom: '20px' }} />
					<Text
						style={{
							...resetText,
							fontSize: '12px',
							color: '#94a3b8',
							textAlign: 'center',
						}}
					>
						This is an automated notification from Barely. You&apos;re receiving this
						because you&apos;re approaching a usage limit on your account.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

UsageWarning80EmailTemplate.PreviewProps = {
	resourceType: 'fans',
	resourceLabel: 'Fans/Contacts',
	currentUsage: 850,
	limit: 1000,
	workspaceName: 'My Music Project',
	upgradeUrl: 'https://app.barely.ai/my-project/settings/billing/upgrade',
} satisfies UsageWarning80EmailProps;

export default UsageWarning80EmailTemplate;
