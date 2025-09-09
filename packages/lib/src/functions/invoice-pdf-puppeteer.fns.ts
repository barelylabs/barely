import type { Invoice, InvoiceClient, Workspace } from '@barely/validators';
import type { Browser } from 'puppeteer';
// import puppeteer from 'puppeteer';
import { getAbsoluteUrl, isDevelopment } from '@barely/utils';

// import chromium from '@sparticuz/chromium';

export interface InvoicePDFProps {
	invoice: Invoice;
	workspace: Pick<Workspace, 'handle'> & Partial<Workspace>;
	client: Pick<InvoiceClient, 'name' | 'email'> & Partial<InvoiceClient>;
}

/**
 * Generate an invoice PDF using Puppeteer to render the web version
 * This provides perfect visual consistency between web and PDF
 */
export async function generateInvoicePDFWithPuppeteer(
	props: InvoicePDFProps,
): Promise<Buffer> {
	console.log('🚀 Starting Puppeteer PDF generation for invoice:', props.invoice.id);

	let browser: Browser | undefined | null;
	try {
		if (isDevelopment()) {
			const puppeteer = await import('puppeteer');
			browser = await puppeteer.launch({
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
				headless: true,
				executablePath: '/opt/homebrew/bin/chromium',
			});
		} else {
			const puppeteer = await import('puppeteer-core');
			const { default: Chromium } = await import('@sparticuz/chromium');
			browser = await puppeteer.launch({
				args: Chromium.args,
				defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
				executablePath: await Chromium.executablePath(),
				headless: true,
			});
		}

		const page = await browser.newPage();

		// Set viewport for consistent rendering
		await page.setViewport({
			width: 1200,
			height: 1600,
			deviceScaleFactor: 2,
		});

		// Set user agent to help with font loading
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		);

		// Add internal auth header for server-side access
		const secret = process.env.INTERNAL_PDF_SECRET;

		await page.setExtraHTTPHeaders({
			'X-Internal-PDF-Request': secret ?? '',
		});

		// Navigate to PDF route
		const pdfUrl = getAbsoluteUrl(
			'invoice',
			`/${props.workspace.handle}/${props.invoice.id}/pdf`,
		);

		const response = await page.goto(pdfUrl, {
			waitUntil: ['domcontentloaded', 'load', 'networkidle0'],
			timeout: 30000,
		});

		if (!response?.ok()) {
			const responseText = await page.content();
			console.error('❌ Page response not OK. Content:', responseText.substring(0, 500));
			throw new Error(`HTTP ${response?.status()}: Failed to load PDF page`);
		}

		// Wait for fonts to load
		await page.evaluateHandle('document.fonts.ready');

		// Generate PDF with proper A4 settings
		const pdf = await page.pdf({
			format: 'A4',
			margin: {
				top: '15mm',
				bottom: '15mm',
				left: '15mm',
				right: '15mm',
			},
			printBackground: true,
			preferCSSPageSize: true,
			displayHeaderFooter: false,
			path: '/Users/barely/Downloads/invoice-debug-01.pdf',
		});

		return Buffer.from(pdf);
	} catch (error) {
		console.error('Puppeteer PDF generation error:', error);
		throw new Error(
			`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	} finally {
		if (browser) {
			await browser.close();
		}
		// Ensure page is closed
		// if (page) {
		// 	await page.close();
		// }
		// // Ensure browser is closed
		// await browser.close();
	}
}

/**
 * Generate PDF and return as base64 string (compatible with existing interface)
 */
export async function generateInvoicePDFBase64Puppeteer(
	props: InvoicePDFProps,
): Promise<string> {
	const pdfBuffer = await generateInvoicePDFWithPuppeteer(props);
	return pdfBuffer.toString('base64');
}
