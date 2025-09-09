# Puppeteer-based Invoice PDF Generation Implementation Guide

## Overview
This document outlines the complete implementation plan for replacing the current React PDF approach with Puppeteer to generate PDFs directly from the existing `InvoiceRender` React component.

## Current State
- ✅ Working `InvoiceRender` component at `packages/ui/src/invoice/invoice-render.tsx`
- ✅ Component used in `apps/invoice/src/app/pay/[handle]/[invoiceId]/invoice-payment-client.tsx`
- ✅ Current React PDF implementation in `packages/lib/src/functions/invoice-pdf.fns.ts`
- ✅ tRPC route at `packages/api/src/public/invoice-render.route.ts` with `downloadInvoicePdf` procedure
- ✅ Inter font files available at `apps/invoice/public/inter/` (all weights)

## Benefits of Puppeteer Approach
- **Perfect visual consistency** - Same component renders web and PDF
- **Single source of truth** - No duplicate styling code to maintain  
- **Better typography** - Use existing Inter fonts seamlessly via CSS
- **Easier maintenance** - Changes to invoice design apply everywhere
- **Future-proof** - Easy to add features like logos, custom branding

## Implementation Steps

### 1. Add Puppeteer Dependencies
Add to `packages/lib/package.json`:
```json
{
  "dependencies": {
    "puppeteer": "^21.5.0"
  }
}
```

### 2. Create PDF-Specific Route
**File: `apps/invoice/src/app/[handle]/[invoiceId]/pdf/page.tsx`**

This route will:
- Render the same `InvoiceRender` component
- Include PDF-specific styling
- Accept special server-side authentication
- Be optimized for A4 printing

Key features:
- Use `isPdfMode={true}` prop for PDF optimizations
- Include print CSS for proper page sizing
- Remove any interactive elements
- Ensure consistent Inter font loading

### 3. Update InvoiceRender Component
**File: `packages/ui/src/invoice/invoice-render.tsx`**

Add new props:
```typescript
export interface InvoiceRenderProps {
  // ... existing props
  isPdfMode?: boolean; // New prop for PDF-specific optimizations
}
```

PDF mode optimizations:
- Remove any interactive elements (buttons, etc.)
- Optimize spacing for A4 pages
- Ensure print-friendly colors
- Handle page breaks appropriately

### 4. Add Print CSS Styling
**File: `apps/invoice/src/app/[handle]/[invoiceId]/pdf/page.module.css`**

Print-specific CSS:
```css
@page {
  size: A4;
  margin: 20mm 15mm;
}

@media print {
  .pdf-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 10pt;
    line-height: 1.4;
  }
  
  .no-print {
    display: none !important;
  }
  
  .page-break {
    page-break-before: always;
  }
}
```

### 5. Create Puppeteer PDF Service
**File: `packages/lib/src/functions/invoice-pdf-puppeteer.fns.ts`**

Core function:
```typescript
export async function generateInvoicePDFWithPuppeteer(props: InvoicePDFProps): Promise<Buffer> {
  const puppeteer = await import('puppeteer');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Navigate to PDF route
  const pdfUrl = getAbsoluteUrl('invoice', `/${props.workspace.handle}/${props.invoice.id}/pdf`);
  await page.goto(pdfUrl, { waitUntil: 'networkidle0' });
  
  // Generate PDF
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    printBackground: true,
    preferCSSPageSize: true
  });
  
  await browser.close();
  return Buffer.from(pdf);
}
```

Key considerations:
- Authentication bypass for server-side access
- Proper error handling and browser cleanup
- Font loading wait conditions
- Memory management for production use

### 6. Update tRPC Route
**File: `packages/api/src/public/invoice-render.route.ts`**

Update the `downloadInvoicePdf` procedure:
```typescript
downloadInvoicePdf: publicProcedure
  .input(/* existing input schema */)
  .mutation(async ({ input }) => {
    // ... existing validation logic
    
    try {
      // Try Puppeteer approach first
      const pdfBuffer = await generateInvoicePDFWithPuppeteer({
        invoice,
        workspace: invoice.workspace,
        client: invoice.client,
      });
      
      return {
        pdf: pdfBuffer.toString('base64'),
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
      };
    } catch (error) {
      console.warn('Puppeteer PDF generation failed, falling back to React PDF:', error);
      
      // Fallback to existing React PDF implementation
      const pdfBase64 = await generateInvoicePDFBase64({
        invoice,
        workspace: invoice.workspace,
        client: invoice.client,
      });
      
      return {
        pdf: pdfBase64,
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
      };
    }
  }),
```

### 7. Authentication Strategy
The PDF route needs to be accessible server-side. Options:
1. **Special server header** - Add internal auth header for Puppeteer requests
2. **Temporary token** - Generate short-lived token for PDF access
3. **IP allowlist** - Allow localhost/server IPs to bypass auth

Recommended approach: Special header method:
```typescript
// In PDF route
export async function GET(request: Request) {
  const isServerRequest = request.headers.get('X-Internal-PDF-Request') === process.env.INTERNAL_PDF_SECRET;
  
  if (!isServerRequest) {
    // Normal authentication flow
  }
  
  // Render PDF version
}
```

### 8. Production Considerations
- **Docker compatibility** - Ensure Puppeteer works in containerized environments
- **Memory limits** - Configure proper memory limits for browser instances
- **Concurrent requests** - Handle multiple PDF generations gracefully
- **Caching** - Consider caching identical invoice PDFs
- **Error monitoring** - Comprehensive error tracking and fallbacks

## Environment Variables
Add to `.env`:
```
INTERNAL_PDF_SECRET=your-secret-key-here
```

## Testing Strategy
1. **Unit tests** - Test PDF generation with mock invoices
2. **Integration tests** - End-to-end PDF download testing  
3. **Visual regression** - Compare PDF output with web version
4. **Performance tests** - Memory usage and generation speed
5. **Fallback tests** - Ensure React PDF fallback works

## Migration Plan
1. Implement Puppeteer approach alongside existing React PDF
2. Feature flag to toggle between approaches
3. A/B test with small percentage of requests
4. Monitor error rates and performance
5. Full rollout once stable
6. Remove old React PDF code after successful migration

## File Structure
```
apps/invoice/
├── src/app/[handle]/[invoiceId]/
│   ├── page.tsx (existing)
│   └── pdf/
│       ├── page.tsx (new PDF route)
│       └── page.module.css (print styles)

packages/lib/src/functions/
├── invoice-pdf.fns.ts (existing React PDF)
├── invoice-pdf-puppeteer.fns.ts (new Puppeteer)

packages/api/src/public/
└── invoice-render.route.ts (updated with fallback logic)

packages/ui/src/invoice/
└── invoice-render.tsx (updated with isPdfMode)
```

## Success Metrics
- PDF visual fidelity matches web version 100%
- Generation time under 3 seconds
- Memory usage stays within container limits
- Error rate under 1% with fallback working
- Inter fonts render correctly in all PDF viewers