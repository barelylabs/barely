import React from 'react';
import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Section,
	Text,
} from '@react-email/components';

import { InvoiceFooter } from '../../components/invoice-footer';
import { container, heading, main, resetText } from '../../styles';

export interface InvoiceReminderEmailProps {
	invoiceNumber: string;
	workspaceName: string;
	workspaceLogo?: string;
	dueDate: Date;
	clientName: string;
	clientEmail: string;
	clientCompany?: string;
	total: string;
	paymentUrl: string;
	trackingPixelUrl?: string;
	supportEmail: string;
	memo?: string;
	daysOverdue?: number;
}

export function InvoiceReminderEmailTemplate({
	invoiceNumber,
	workspaceName,
	workspaceLogo,
	dueDate,
	total,
	paymentUrl,
	trackingPixelUrl,
	memo,
	daysOverdue,
}: InvoiceReminderEmailProps) {
	const previewText = `Payment overdue for invoice ${invoiceNumber} from ${workspaceName}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Header with Logo */}
					{workspaceLogo && (
						<Section style={{ textAlign: 'center', marginBottom: '30px' }}>
							<Img
								src={workspaceLogo}
								width='60'
								height='60'
								alt={workspaceName}
								style={{ margin: '0 auto' }}
							/>
						</Section>
					)}

					{/* Main Heading */}
					<Section style={{ textAlign: 'center', marginBottom: '20px' }}>
						<Text
							style={{
								...heading,
								fontSize: '28px',
								fontWeight: 'bold',
								margin: '0 0 10px 0',
								color: '#dc2626', // Red color for urgency
							}}
						>
							Payment Overdue
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0',
							}}
						>
							Invoice #{invoiceNumber} from {workspaceName}
						</Text>
					</Section>

					<Hr style={{ marginTop: '30px', marginBottom: '30px' }} />

					{/* Overdue Notice Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#fef2f2', // Light red background
							borderLeft: '4px solid #dc2626',
							padding: '20px',
							marginBottom: '30px',
						}}
					>
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#991b1b',
								margin: '0',
								fontWeight: '500',
							}}
						>
							⚠️ This invoice is{' '}
							{daysOverdue && daysOverdue > 0 ? `${daysOverdue} days` : ''} overdue
						</Text>
						<Text
							style={{
								...resetText,
								fontSize: '14px',
								color: '#7f1d1d',
								margin: '10px 0 0 0',
							}}
						>
							Please submit payment as soon as possible to avoid any service
							interruptions.
						</Text>
					</Section>

					{/* Summary Box */}
					<Section
						style={{
							borderRadius: '8px',
							backgroundColor: '#f9fafb',
							padding: '30px',
							marginBottom: '30px',
							textAlign: 'center',
						}}
					>
						{/* Total Amount */}
						<Text
							style={{
								...resetText,
								fontSize: '36px',
								fontWeight: 'bold',
								margin: '0 0 15px 0',
								color: '#0f172a',
							}}
						>
							{total}
						</Text>

						{/* Original Due Date */}
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#dc2626', // Red for overdue
								margin: '0 0 20px 0',
								fontWeight: '500',
							}}
						>
							Was due on{' '}
							<span style={{ textDecoration: 'underline' }}>
								{dueDate.toLocaleDateString(undefined, {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								})}
							</span>
						</Text>

						{/* Memo/Notes */}
						{memo && (
							<Text
								style={{
									...resetText,
									fontSize: '14px',
									color: '#475569',
									margin: '0',
									lineHeight: '1.5',
								}}
							>
								{memo}
							</Text>
						)}
					</Section>

					{/* Payment Button */}
					<Section style={{ textAlign: 'center', marginBottom: '40px' }}>
						<Button
							href={paymentUrl}
							style={{
								backgroundColor: '#dc2626', // Red button for urgency
								borderRadius: '8px',
								color: '#ffffff',
								fontSize: '16px',
								fontWeight: 'bold',
								textDecoration: 'none',
								textAlign: 'center',
								display: 'inline-block',
								padding: '14px 40px',
							}}
						>
							Pay Now
						</Button>
						<Text
							style={{
								...resetText,
								fontSize: '12px',
								color: '#64748b',
								margin: '10px 0 0 0',
							}}
						>
							Click the button above to pay this invoice immediately
						</Text>
					</Section>

					{/* Footer */}
					<InvoiceFooter workspaceName={workspaceName} />

					{/* Tracking Pixel */}
					{trackingPixelUrl && (
						<Img
							src={trackingPixelUrl}
							width='1'
							height='1'
							alt=''
							style={{ display: 'block', height: '1px', width: '1px' }}
						/>
					)}
				</Container>
			</Body>
		</Html>
	);
}

InvoiceReminderEmailTemplate.PreviewProps = {
	invoiceNumber: 'INV-TEST-000001',
	workspaceName: 'Barely Creative',
	dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
	clientName: 'John Smith',
	clientEmail: 'john@example.com',
	clientCompany: 'Smith Industries',
	total: '$3,588.75',
	paymentUrl: 'https://invoice.barely.ai/pay/test-workspace/test-invoice',
	supportEmail: 'support@barely.ai',
	memo: 'Payment for creative services rendered in December 2024',
	daysOverdue: 7,
} satisfies InvoiceReminderEmailProps;

export default InvoiceReminderEmailTemplate;
