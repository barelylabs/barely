import type { exportFansSchema } from '@barely/validators';
import type { z } from 'zod/v4';

interface FanExportData {
	id: string;
	firstName: string | null;
	lastName: string | null;
	fullName: string;
	email: string;
	phoneNumber: string | null;
	emailMarketingOptIn: boolean;
	smsMarketingOptIn: boolean;
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
	shippingAddressCity: string | null;
	shippingAddressState: string | null;
	shippingAddressCountry: string | null;
	shippingAddressPostalCode: string | null;
	billingAddressPostalCode: string | null;
	billingAddressCountry: string | null;
	appReferer: string | null;
	createdAt: Date;
	updatedAt: Date | null;
	archivedAt: Date | null;
}

type ExportFormat = z.infer<typeof exportFansSchema>['format'];

interface FieldMapping {
	csvHeader: string;
	dbField: keyof FanExportData;
	formatter?: (value: FanExportData[keyof FanExportData]) => string;
}

// Format-specific field mappings
const FIELD_MAPPINGS: Record<ExportFormat, FieldMapping[]> = {
	mailchimp: [
		{ csvHeader: 'Email Address', dbField: 'email' },
		{ csvHeader: 'First Name', dbField: 'firstName', formatter: v => String(v ?? '') },
		{ csvHeader: 'Last Name', dbField: 'lastName', formatter: v => String(v ?? '') },
		{
			csvHeader: 'Email Marketing',
			dbField: 'emailMarketingOptIn',
			formatter: v => (v ? 'subscribed' : 'unsubscribed'),
		},
		{
			csvHeader: 'Phone Number',
			dbField: 'phoneNumber',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Address Line 1',
			dbField: 'shippingAddressLine1',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Address Line 2',
			dbField: 'shippingAddressLine2',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'City',
			dbField: 'shippingAddressCity',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'State',
			dbField: 'shippingAddressState',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Country',
			dbField: 'shippingAddressCountry',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Postal Code',
			dbField: 'shippingAddressPostalCode',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Tags',
			dbField: 'appReferer',
			formatter: v => (v ? `source:${String(v)}` : ''),
		},
		{
			csvHeader: 'OPTIN_TIME',
			dbField: 'createdAt',
			formatter: v => (v ? new Date(v as Date).toISOString() : ''),
		},
	],
	klaviyo: [
		{ csvHeader: 'email', dbField: 'email' },
		{ csvHeader: 'first_name', dbField: 'firstName', formatter: v => String(v ?? '') },
		{ csvHeader: 'last_name', dbField: 'lastName', formatter: v => String(v ?? '') },
		{
			csvHeader: 'phone_number',
			dbField: 'phoneNumber',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'accepts_marketing',
			dbField: 'emailMarketingOptIn',
			formatter: v => (v ? 'TRUE' : 'FALSE'),
		},
		{
			csvHeader: 'accepts_sms',
			dbField: 'smsMarketingOptIn',
			formatter: v => (v ? 'TRUE' : 'FALSE'),
		},
		{
			csvHeader: 'address1',
			dbField: 'shippingAddressLine1',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'address2',
			dbField: 'shippingAddressLine2',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'city',
			dbField: 'shippingAddressCity',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'region',
			dbField: 'shippingAddressState',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'country',
			dbField: 'shippingAddressCountry',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'zip',
			dbField: 'shippingAddressPostalCode',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'source',
			dbField: 'appReferer',
			formatter: v => String(v ?? 'barely'),
		},
		{
			csvHeader: 'created',
			dbField: 'createdAt',
			formatter: v => (v ? new Date(v as Date).toISOString() : ''),
		},
	],
	constantcontact: [
		{ csvHeader: 'Email', dbField: 'email' },
		{ csvHeader: 'First Name', dbField: 'firstName', formatter: v => String(v ?? '') },
		{ csvHeader: 'Last Name', dbField: 'lastName', formatter: v => String(v ?? '') },
		{
			csvHeader: 'Phone - Mobile',
			dbField: 'phoneNumber',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Street 1',
			dbField: 'shippingAddressLine1',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Street 2',
			dbField: 'shippingAddressLine2',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'City',
			dbField: 'shippingAddressCity',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'State',
			dbField: 'shippingAddressState',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Country',
			dbField: 'shippingAddressCountry',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Postal Code',
			dbField: 'shippingAddressPostalCode',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Source',
			dbField: 'appReferer',
			formatter: v => String(v ?? 'Barely'),
		},
		{
			csvHeader: 'Date Added',
			dbField: 'createdAt',
			formatter: (v): string => {
				if (!v) return '';
				return new Date(v as Date).toISOString().split('T')[0] ?? '';
			},
		},
	],
	generic: [
		{ csvHeader: 'ID', dbField: 'id' },
		{ csvHeader: 'Email', dbField: 'email' },
		{ csvHeader: 'First Name', dbField: 'firstName', formatter: v => String(v ?? '') },
		{ csvHeader: 'Last Name', dbField: 'lastName', formatter: v => String(v ?? '') },
		{ csvHeader: 'Full Name', dbField: 'fullName' },
		{
			csvHeader: 'Phone Number',
			dbField: 'phoneNumber',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Email Marketing Opt-In',
			dbField: 'emailMarketingOptIn',
			formatter: v => (v ? 'Yes' : 'No'),
		},
		{
			csvHeader: 'SMS Marketing Opt-In',
			dbField: 'smsMarketingOptIn',
			formatter: v => (v ? 'Yes' : 'No'),
		},
		{
			csvHeader: 'Address Line 1',
			dbField: 'shippingAddressLine1',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Address Line 2',
			dbField: 'shippingAddressLine2',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'City',
			dbField: 'shippingAddressCity',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'State',
			dbField: 'shippingAddressState',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Country',
			dbField: 'shippingAddressCountry',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Postal Code',
			dbField: 'shippingAddressPostalCode',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Billing Postal Code',
			dbField: 'billingAddressPostalCode',
			formatter: v => String(v ?? ''),
		},
		{
			csvHeader: 'Billing Country',
			dbField: 'billingAddressCountry',
			formatter: v => String(v ?? ''),
		},
		{ csvHeader: 'Source', dbField: 'appReferer', formatter: v => String(v ?? '') },
		{
			csvHeader: 'Created At',
			dbField: 'createdAt',
			formatter: v => (v ? new Date(v as Date).toISOString() : ''),
		},
		{
			csvHeader: 'Updated At',
			dbField: 'updatedAt',
			formatter: v => (v ? new Date(v as Date).toISOString() : ''),
		},
		{
			csvHeader: 'Archived At',
			dbField: 'archivedAt',
			formatter: v => (v ? new Date(v as Date).toISOString() : ''),
		},
	],
};

function escapeCSVValue(value: string): string {
	// Remove null bytes and other control characters that could break CSV parsing
	// Keep only printable characters, tabs, and newlines
	// eslint-disable-next-line no-control-regex
	let sanitized = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

	// Normalize line endings to \n
	sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

	// Trim excessive whitespace (keep single spaces)
	sanitized = sanitized.replace(/\s+/g, ' ').trim();

	// If value contains comma, newline, tab, or double quote, wrap in quotes
	if (
		sanitized.includes(',') ||
		sanitized.includes('\n') ||
		sanitized.includes('\t') ||
		sanitized.includes('"') ||
		sanitized.startsWith(' ') ||
		sanitized.endsWith(' ')
	) {
		// Escape double quotes by doubling them
		return `"${sanitized.replace(/"/g, '""')}"`;
	}

	return sanitized;
}

export function generateFansCSV(
	fans: FanExportData[],
	format: ExportFormat = 'generic',
	customFields?: string[],
): string {
	const fieldMappings = FIELD_MAPPINGS[format];

	// Filter fields if custom selection provided
	const selectedMappings =
		customFields?.length ?
			fieldMappings.filter(mapping => customFields.includes(mapping.csvHeader))
		:	fieldMappings;

	// Generate header row
	const headers = selectedMappings.map(mapping => escapeCSVValue(mapping.csvHeader));
	const csvRows = [headers.join(',')];

	// Generate data rows
	for (const fan of fans) {
		const row = selectedMappings.map(mapping => {
			const value = fan[mapping.dbField];
			const formattedValue =
				mapping.formatter ? mapping.formatter(value) : String(value ?? '');
			return escapeCSVValue(formattedValue);
		});
		csvRows.push(row.join(','));
	}

	// Add UTF-8 BOM for Excel compatibility
	const BOM = '\uFEFF';
	return BOM + csvRows.join('\n');
}

export function generateExportFilename(
	format: ExportFormat,
	workspaceName?: string,
): string {
	const date = new Date().toISOString().split('T')[0];
	const prefix =
		workspaceName ? `${workspaceName.toLowerCase().replace(/\s+/g, '-')}-` : '';
	return `${prefix}fans-export-${format}-${date}.csv`;
}
