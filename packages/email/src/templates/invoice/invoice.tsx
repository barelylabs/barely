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

export interface InvoiceEmailProps {
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
}

export function InvoiceEmailTemplate({
	invoiceNumber,
	workspaceName,
	workspaceLogo,
	dueDate,
	total,
	paymentUrl,
	trackingPixelUrl,
	memo,
}: InvoiceEmailProps) {
	const previewText = `Invoice ${invoiceNumber} from ${workspaceName}`;

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
							}}
						>
							You've been sent a new invoice
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

						{/* Due Date */}
						<Text
							style={{
								...resetText,
								fontSize: '16px',
								color: '#64748b',
								margin: '0 0 20px 0',
							}}
						>
							Due by{' '}
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
								backgroundColor: '#5563eb',
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
							Pay Invoice
						</Button>
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

InvoiceEmailTemplate.PreviewProps = {
	invoiceNumber: 'INV-TEST-000001',
	workspaceName: 'Barely Creative',
	dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
	clientName: 'John Smith',
	clientEmail: 'john@example.com',
	clientCompany: 'Smith Industries',
	total: '$3,588.75',
	paymentUrl: 'https://invoice.barely.ai/pay/test-workspace/test-invoice',
	supportEmail: 'support@barely.ai',
	memo: 'Payment is due within 7 days. Thank you for your business!',
} satisfies InvoiceEmailProps;

export default InvoiceEmailTemplate;
