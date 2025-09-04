import React from 'react';
import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Hr,
	Html,
	Img,
	Preview,
	Row,
	Section,
	Text,
} from '@react-email/components';

import { EmailFooter } from '../../components/email-footer';
import {
	InformationTableColumn,
	InformationTableLabel,
	InformationTableRow,
	InformationTableValue,
} from '../../primitives';
import { container, heading, main, resetText } from '../../styles';

export interface InvoiceEmailProps {
	invoiceNumber: string;
	workspaceName: string;
	workspaceLogo?: string;
	dueDate: Date;
	clientName: string;
	clientEmail: string;
	clientCompany?: string;
	clientAddress?: string;
	lineItems: {
		description: string;
		quantity: number;
		rate: string;
		amount: string;
	}[];
	subtotal: string;
	taxPercentage?: number;
	taxAmount?: string;
	total: string;
	paymentUrl: string;
	trackingPixelUrl?: string;
	supportEmail: string;
	notes?: string;
}

export function InvoiceEmailTemplate({
	invoiceNumber,
	workspaceName,
	workspaceLogo,
	dueDate,
	clientName,
	clientEmail,
	clientCompany,
	clientAddress,
	lineItems,
	subtotal,
	taxPercentage,
	taxAmount,
	total,
	paymentUrl,
	trackingPixelUrl,
	supportEmail,
	notes,
}: InvoiceEmailProps) {
	const previewText = `Invoice ${invoiceNumber} from ${workspaceName}`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>

			<Body style={main}>
				<Container style={container}>
					{/* Header */}
					<Section>
						<Row>
							<Column>
								<Img
									src={workspaceLogo ?? 'https://app.barely.ai/_static/logo.png'}
									width='42'
									height='42'
									alt={workspaceName}
								/>
							</Column>

							<Column align='right' style={{ display: 'table-cell' }}>
								<Text style={{ ...heading, fontWeight: 'bold', fontSize: '24px' }}>
									INVOICE
								</Text>
								<Text style={{ ...resetText, color: '#64748b', marginTop: '4px' }}>
									{invoiceNumber}
								</Text>
							</Column>
						</Row>
					</Section>

					<Hr style={{ marginTop: '20px', marginBottom: '20px' }} />

					{/* Invoice Details */}
					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '2px',
							borderRadius: '0.75rem',
							backgroundColor: '#f9fafb',
							fontSize: '14px',
							marginBottom: '20px',
						}}
					>
						<Row>
							<InformationTableColumn>
								<InformationTableRow>
									<InformationTableLabel>From</InformationTableLabel>
									<InformationTableValue>
										<span style={{ fontWeight: 'bold' }}>{workspaceName}</span>
									</InformationTableValue>
								</InformationTableRow>

								<InformationTableRow>
									<InformationTableLabel>Due Date</InformationTableLabel>
									<InformationTableValue>
										{dueDate.toLocaleDateString(undefined, {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</InformationTableValue>
								</InformationTableRow>
							</InformationTableColumn>

							<InformationTableColumn>
								<InformationTableRow>
									<InformationTableLabel>Bill To</InformationTableLabel>
									<InformationTableValue>
										<span style={{ fontWeight: 'bold' }}>{clientName}</span>
									</InformationTableValue>
									{clientCompany && (
										<InformationTableValue>{clientCompany}</InformationTableValue>
									)}
									<InformationTableValue>{clientEmail}</InformationTableValue>
									{clientAddress && (
										<InformationTableValue>
											<span style={{ whiteSpace: 'pre-line' }}>{clientAddress}</span>
										</InformationTableValue>
									)}
								</InformationTableRow>
							</InformationTableColumn>
						</Row>
					</Section>

					{/* Line Items */}
					<Section
						style={{
							borderCollapse: 'collapse',
							borderSpacing: '0',
							borderRadius: '0.75rem',
							fontSize: '14px',
						}}
					>
						<Row style={{ marginBottom: '12px' }}>
							<Column style={{ width: '50%' }}>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										fontWeight: 'bold',
										textTransform: 'uppercase',
										color: '#64748b',
									}}
								>
									Description
								</Text>
							</Column>
							<Column style={{ width: '15%' }} align='right'>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										fontWeight: 'bold',
										textTransform: 'uppercase',
										color: '#64748b',
									}}
								>
									Qty
								</Text>
							</Column>
							<Column style={{ width: '15%' }} align='right'>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										fontWeight: 'bold',
										textTransform: 'uppercase',
										color: '#64748b',
									}}
								>
									Rate
								</Text>
							</Column>
							<Column style={{ width: '20%' }} align='right'>
								<Text
									style={{
										...resetText,
										fontSize: '12px',
										fontWeight: 'bold',
										textTransform: 'uppercase',
										color: '#64748b',
									}}
								>
									Amount
								</Text>
							</Column>
						</Row>

						<Hr style={{ margin: '0 0 12px 0' }} />

						{lineItems.map((item, index) => (
							<Row key={index} style={{ marginBottom: '12px' }}>
								<Column style={{ width: '50%' }}>
									<Text style={{ ...resetText, fontSize: '14px' }}>
										{item.description}
									</Text>
								</Column>
								<Column style={{ width: '15%' }} align='right'>
									<Text style={{ ...resetText, fontSize: '14px' }}>{item.quantity}</Text>
								</Column>
								<Column style={{ width: '15%' }} align='right'>
									<Text style={{ ...resetText, fontSize: '14px' }}>{item.rate}</Text>
								</Column>
								<Column style={{ width: '20%' }} align='right'>
									<Text style={{ ...resetText, fontSize: '14px' }}>{item.amount}</Text>
								</Column>
							</Row>
						))}

						<Hr style={{ margin: '20px 0 12px 0' }} />

						{/* Totals */}
						<Section style={{ width: 'fit-content' }} align='right'>
							<Row>
								<Column
									style={{ display: 'table-cell', paddingRight: '20px' }}
									align='right'
								>
									<Text style={{ ...resetText, fontSize: '14px' }}>Subtotal:</Text>
								</Column>
								<Column align='right' style={{ display: 'table-cell', width: '120px' }}>
									<Text style={{ ...resetText, fontSize: '14px' }}>{subtotal}</Text>
								</Column>
							</Row>

							{taxAmount && taxPercentage !== undefined && (
								<Row style={{ marginTop: '8px' }}>
									<Column
										style={{ display: 'table-cell', paddingRight: '20px' }}
										align='right'
									>
										<Text style={{ ...resetText, fontSize: '14px' }}>
											Tax ({(taxPercentage / 100).toFixed(1)}%):
										</Text>
									</Column>
									<Column align='right' style={{ display: 'table-cell', width: '120px' }}>
										<Text style={{ ...resetText, fontSize: '14px' }}>{taxAmount}</Text>
									</Column>
								</Row>
							)}

							<Row style={{ marginTop: '12px' }}>
								<Column
									style={{ display: 'table-cell', paddingRight: '20px' }}
									align='right'
								>
									<Text style={{ ...resetText, fontSize: '16px', fontWeight: 'bold' }}>
										Total Due:
									</Text>
								</Column>
								<Column align='right' style={{ display: 'table-cell', width: '120px' }}>
									<Text style={{ ...resetText, fontSize: '16px', fontWeight: 'bold' }}>
										{total}
									</Text>
								</Column>
							</Row>
						</Section>
					</Section>

					{/* Notes */}
					{notes && (
						<Section style={{ marginTop: '30px' }}>
							<Text
								style={{
									...resetText,
									fontSize: '12px',
									fontWeight: 'bold',
									color: '#64748b',
								}}
							>
								Notes
							</Text>
							<Text style={{ ...resetText, fontSize: '14px', marginTop: '8px' }}>
								{notes}
							</Text>
						</Section>
					)}

					{/* Payment Button */}
					<Section style={{ marginTop: '40px', textAlign: 'center' }}>
						<Button
							href={paymentUrl}
							style={{
								backgroundColor: '#000000',
								borderRadius: '8px',
								color: '#ffffff',
								fontSize: '16px',
								fontWeight: 'bold',
								textDecoration: 'none',
								textAlign: 'center',
								display: 'inline-block',
								padding: '12px 32px',
							}}
						>
							Pay Invoice
						</Button>
						<Text
							style={{
								...resetText,
								textAlign: 'center',
								color: '#64748b',
								fontSize: '12px',
								marginTop: '12px',
							}}
						>
							Pay securely with Stripe
						</Text>
					</Section>

					{/* Support */}
					<Section style={{ marginTop: '40px' }}>
						<Hr style={{ marginBottom: '20px' }} />
						<Row>
							<Column align='center'>
								<Text
									style={{
										...resetText,
										textAlign: 'center',
										color: '#64748b',
										fontSize: '12px',
									}}
								>
									Questions about this invoice?{' '}
									<a
										href={`mailto:${supportEmail}`}
										style={{ color: '#000000', textDecoration: 'underline' }}
									>
										Contact us
									</a>
								</Text>
							</Column>
						</Row>
					</Section>

					{/* Footer */}
					<EmailFooter />

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
	clientAddress: '123 Main St\nSuite 100\nNew York, NY 10001',
	lineItems: [
		{
			description: 'Website Design',
			quantity: 1,
			rate: '$2,500.00',
			amount: '$2,500.00',
		},
		{
			description: 'Logo Design',
			quantity: 1,
			rate: '$500.00',
			amount: '$500.00',
		},
		{
			description: 'Business Cards (500 qty)',
			quantity: 2,
			rate: '$150.00',
			amount: '$300.00',
		},
	],
	subtotal: '$3,300.00',
	taxPercentage: 875, // 8.75%
	taxAmount: '$288.75',
	total: '$3,588.75',
	paymentUrl: 'https://invoice.barely.ai/pay/test-workspace/test-invoice',
	supportEmail: 'support@barely.ai',
	notes: 'Payment is due within 7 days. Thank you for your business!',
} satisfies InvoiceEmailProps;

export default InvoiceEmailTemplate;
