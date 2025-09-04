import type {
	Invoice,
	InvoiceClient,
	InvoiceLineItem,
	Workspace,
} from '@barely/validators';
import type { DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { formatMinorToMajorCurrency, raise } from '@barely/utils';
import { Document, Font, Page, pdf, StyleSheet, Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register default fonts
Font.register({
	family: 'Inter',
	fonts: [
		{
			src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2',
			fontWeight: 400,
		},
		{
			src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hiA.woff2',
			fontWeight: 600,
		},
		{
			src: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2',
			fontWeight: 700,
		},
	],
});

// PDF Styles
const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: 'Inter',
		fontSize: 10,
		color: '#111827',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 30,
	},
	title: {
		fontSize: 24,
		fontWeight: 700,
		marginBottom: 4,
	},
	invoiceNumber: {
		fontSize: 14,
		color: '#6B7280',
	},
	status: {
		padding: '4 8',
		borderRadius: 4,
		fontSize: 8,
		textTransform: 'uppercase',
		fontWeight: 600,
	},
	statusCreated: {
		backgroundColor: '#F3F4F6',
		color: '#6B7280',
	},
	statusSent: {
		backgroundColor: '#DBEAFE',
		color: '#1D4ED8',
	},
	statusViewed: {
		backgroundColor: '#FEF3C7',
		color: '#D97706',
	},
	statusPaid: {
		backgroundColor: '#D1FAE5',
		color: '#059669',
	},
	statusVoided: {
		backgroundColor: '#F9FAFB',
		color: '#9CA3AF',
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 8,
		fontWeight: 600,
		color: '#6B7280',
		textTransform: 'uppercase',
		letterSpacing: 0.5,
		marginBottom: 8,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	col: {
		flex: 1,
	},
	label: {
		fontSize: 9,
		color: '#6B7280',
		marginBottom: 2,
	},
	value: {
		fontSize: 11,
		color: '#111827',
		fontWeight: 500,
	},
	table: {
		marginTop: 20,
		marginBottom: 20,
	},
	tableHeader: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E7EB',
		paddingBottom: 8,
		marginBottom: 8,
	},
	tableRow: {
		flexDirection: 'row',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#F3F4F6',
	},
	tableCol1: {
		flex: 3,
	},
	tableCol2: {
		flex: 1,
		textAlign: 'center',
	},
	tableCol3: {
		flex: 1.5,
		textAlign: 'right',
	},
	tableCol4: {
		flex: 1.5,
		textAlign: 'right',
	},
	tableHeaderText: {
		fontSize: 8,
		fontWeight: 600,
		color: '#6B7280',
		textTransform: 'uppercase',
	},
	tableCellText: {
		fontSize: 10,
		color: '#111827',
	},
	totalsContainer: {
		marginLeft: 'auto',
		width: 200,
		marginTop: 20,
	},
	totalRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 4,
	},
	totalLabel: {
		fontSize: 10,
		color: '#6B7280',
	},
	totalValue: {
		fontSize: 10,
		color: '#111827',
	},
	grandTotal: {
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
		paddingTop: 8,
		marginTop: 8,
	},
	grandTotalLabel: {
		fontSize: 12,
		fontWeight: 700,
		color: '#111827',
	},
	grandTotalValue: {
		fontSize: 12,
		fontWeight: 700,
		color: '#111827',
	},
	notes: {
		marginTop: 30,
		padding: 12,
		backgroundColor: '#F9FAFB',
		borderRadius: 4,
	},
	notesText: {
		fontSize: 9,
		color: '#6B7280',
		lineHeight: 1.5,
	},
	footer: {
		position: 'absolute',
		bottom: 40,
		left: 40,
		right: 40,
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
		paddingTop: 12,
	},
	footerText: {
		fontSize: 8,
		color: '#9CA3AF',
		textAlign: 'center',
	},
});

interface InvoicePDFProps {
	invoice: Pick<
		Invoice,
		| 'id'
		| 'invoiceNumber'
		| 'poNumber'
		| 'status'
		| 'subtotal'
		| 'tax'
		| 'total'
		| 'dueDate'
		| 'createdAt'
		| 'lineItems'
		| 'notes'
		| 'payerMemo'
	>;

	workspace: Pick<
		Workspace,
		| 'name'
		| 'handle'
		| 'shippingAddressLine1'
		| 'shippingAddressLine2'
		| 'shippingAddressCity'
		| 'shippingAddressState'
		| 'shippingAddressPostalCode'
		| 'shippingAddressCountry'
		| 'currency'
		| 'supportEmail'
		| 'invoiceSupportEmail'
	>;

	client: Pick<InvoiceClient, 'name' | 'email' | 'company' | 'address'>;
}

function createInvoicePDFDocument({
	invoice,
	workspace,
	client,
}: InvoicePDFProps): React.ReactElement<DocumentProps> {
	// Parse line items if they're a string
	const lineItems = (
		typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems)
		: Array.isArray(invoice.lineItems) ? invoice.lineItems
		: []) as InvoiceLineItem[];

	const currency = workspace.currency;

	// Calculate tax amount
	const taxAmount = Math.round((invoice.subtotal * invoice.tax) / 10000);

	// Format dates
	const invoiceDate =
		typeof invoice.createdAt === 'string' ?
			new Date(invoice.createdAt)
		:	invoice.createdAt;
	const dueDate =
		typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;

	const getStatusStyle = () => {
		switch (invoice.status) {
			case 'sent':
				return styles.statusSent;
			case 'viewed':
				return styles.statusViewed;
			case 'paid':
				return styles.statusPaid;
			case 'voided':
				return styles.statusVoided;
			default:
				return styles.statusCreated;
		}
	};

	const supportEmail =
		workspace.invoiceSupportEmail ??
		workspace.supportEmail ??
		raise('supportEmail not found');

	const address =
		workspace.shippingAddressLine1 +
		'\n' +
		workspace.shippingAddressLine2 +
		'\n' +
		workspace.shippingAddressCity +
		'\n' +
		workspace.shippingAddressState +
		'\n' +
		workspace.shippingAddressPostalCode +
		'\n' +
		workspace.shippingAddressCountry;

	// Use React.createElement to avoid JSX syntax issues
	return React.createElement(
		Document,
		{} as DocumentProps,
		React.createElement(
			Page,
			{ size: 'A4', style: styles.page },
			// Header
			React.createElement(
				View,
				{ style: styles.header },
				React.createElement(
					View,
					null,
					React.createElement(Text, { style: styles.title }, 'Invoice'),
					React.createElement(
						Text,
						{ style: styles.invoiceNumber },
						invoice.invoiceNumber,
					),
				),
				React.createElement(
					View,
					{ style: [styles.status, getStatusStyle()] },
					React.createElement(Text, null, invoice.status.toUpperCase()),
				),
			),
			// From/To Section
			React.createElement(
				View,
				{ style: styles.row },
				React.createElement(
					View,
					{ style: styles.col },
					React.createElement(Text, { style: styles.sectionTitle }, 'FROM'),
					React.createElement(Text, { style: styles.value }, workspace.name),
					supportEmail &&
						React.createElement(
							Text,
							{ style: { ...styles.label, marginTop: 2 } },
							supportEmail,
						),
					address &&
						React.createElement(
							Text,
							{ style: { ...styles.label, marginTop: 2 } },
							address,
						),
				),
				React.createElement(
					View,
					{ style: styles.col },
					React.createElement(Text, { style: styles.sectionTitle }, 'TO'),
					React.createElement(Text, { style: styles.value }, client.name),
					client.company &&
						React.createElement(
							Text,
							{ style: { ...styles.label, marginTop: 2 } },
							client.company,
						),
					React.createElement(
						Text,
						{ style: { ...styles.label, marginTop: 2 } },
						client.email,
					),
					// client.phone && // TODO: add phone
					// React.createElement(
					// 	Text,
					// 	{ style: { ...styles.label, marginTop: 2 } },
					// 	client.phone,
					// ),
					client.address &&
						React.createElement(
							Text,
							{ style: { ...styles.label, marginTop: 2 } },
							client.address,
						),
				),
			),
			// Invoice Details
			React.createElement(
				View,
				{ style: [styles.section, { marginTop: 20 }] },
				React.createElement(
					View,
					{ style: styles.row },
					React.createElement(
						View,
						{ style: { flex: 1 } },
						React.createElement(Text, { style: styles.label }, 'Invoice Number'),
						React.createElement(Text, { style: styles.value }, invoice.invoiceNumber),
					),
					invoice.poNumber &&
						React.createElement(
							View,
							{ style: { flex: 1 } },
							React.createElement(Text, { style: styles.label }, 'PO Number'),
							React.createElement(Text, { style: styles.value }, invoice.poNumber),
						),
					React.createElement(
						View,
						{ style: { flex: 1 } },
						React.createElement(Text, { style: styles.label }, 'Invoice Date'),
						React.createElement(
							Text,
							{ style: styles.value },
							format(invoiceDate, 'MMM dd, yyyy'),
						),
					),
					React.createElement(
						View,
						{ style: { flex: 1 } },
						React.createElement(Text, { style: styles.label }, 'Due Date'),
						React.createElement(
							Text,
							{ style: styles.value },
							format(dueDate, 'MMM dd, yyyy'),
						),
					),
				),
			),
			// Line Items Table
			React.createElement(
				View,
				{ style: styles.table },
				React.createElement(
					View,
					{ style: styles.tableHeader },
					React.createElement(
						Text,
						{ style: [styles.tableHeaderText, styles.tableCol1] },
						'ITEM',
					),
					React.createElement(
						Text,
						{ style: [styles.tableHeaderText, styles.tableCol2] },
						'QTY',
					),
					React.createElement(
						Text,
						{ style: [styles.tableHeaderText, styles.tableCol3] },
						'UNIT PRICE',
					),
					React.createElement(
						Text,
						{ style: [styles.tableHeaderText, styles.tableCol4] },
						'TOTAL',
					),
				),
				...lineItems.map((item, index) =>
					React.createElement(
						View,
						{ key: index, style: styles.tableRow },
						React.createElement(
							Text,
							{ style: [styles.tableCellText, styles.tableCol1] },
							item.description,
						),
						React.createElement(
							Text,
							{ style: [styles.tableCellText, styles.tableCol2] },
							String(item.quantity),
						),
						React.createElement(
							Text,
							{ style: [styles.tableCellText, styles.tableCol3] },
							formatMinorToMajorCurrency(item.rate, currency),
						),
						React.createElement(
							Text,
							{ style: [styles.tableCellText, styles.tableCol4] },
							formatMinorToMajorCurrency(item.amount, currency),
						),
					),
				),
			),
			// Totals
			React.createElement(
				View,
				{ style: styles.totalsContainer },
				React.createElement(
					View,
					{ style: styles.totalRow },
					React.createElement(Text, { style: styles.totalLabel }, 'Subtotal'),
					React.createElement(
						Text,
						{ style: styles.totalValue },
						formatMinorToMajorCurrency(invoice.subtotal, currency),
					),
				),
				invoice.tax > 0 &&
					React.createElement(
						View,
						{ style: styles.totalRow },
						React.createElement(
							Text,
							{ style: styles.totalLabel },
							`Tax (${(invoice.tax / 100).toFixed(2)}%)`,
						),
						React.createElement(
							Text,
							{ style: styles.totalValue },
							formatMinorToMajorCurrency(taxAmount, currency),
						),
					),
				React.createElement(
					View,
					{ style: [styles.totalRow, styles.grandTotal] },
					React.createElement(Text, { style: styles.grandTotalLabel }, 'Total'),
					React.createElement(
						Text,
						{ style: styles.grandTotalValue },
						formatMinorToMajorCurrency(invoice.total, currency),
					),
				),
			),
			// Notes/Memo
			(invoice.notes ?? invoice.payerMemo) &&
				React.createElement(
					View,
					{ style: styles.notes },
					invoice.notes &&
						React.createElement(
							View,
							{ style: { marginBottom: 8 } },
							React.createElement(Text, { style: styles.sectionTitle }, 'TERMS'),
							React.createElement(Text, { style: styles.notesText }, invoice.notes),
						),
					invoice.payerMemo &&
						React.createElement(
							View,
							null,
							React.createElement(Text, { style: styles.sectionTitle }, 'MEMO'),
							React.createElement(Text, { style: styles.notesText }, invoice.payerMemo),
						),
				),
			// Footer
			React.createElement(
				View,
				{ style: styles.footer },
				React.createElement(
					Text,
					{ style: styles.footerText },
					'Payment via Manual transfer (ACH/Wire), Pay by Mercury',
				),
			),
		),
	);
}

export async function generateInvoicePDF(props: InvoicePDFProps): Promise<Buffer> {
	const pdfDocument = createInvoicePDFDocument(props);
	const pdfBlob = await pdf(pdfDocument).toBlob();
	const arrayBuffer = await pdfBlob.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

export async function generateInvoicePDFBase64(props: InvoicePDFProps): Promise<string> {
	const buffer = await generateInvoicePDF(props);
	return buffer.toString('base64');
}
