import { TRPCError } from '@trpc/server';

/**
 * Lazy-loaded DOMPurify sanitizer for markdown content
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
let domPurifyModule: typeof import('isomorphic-dompurify') | null = null;

/**
 * Sanitizes markdown content to prevent XSS attacks
 * Uses DOMPurify with a conservative configuration suitable for markdown content
 *
 * @param markdown - Raw markdown content to sanitize
 * @returns Sanitized markdown content safe for storage and rendering
 * @throws TRPCError if sanitization fails
 */
export async function sanitizeMarkdown(markdown: string): Promise<string> {
	if (!markdown || typeof markdown !== 'string') {
		return markdown;
	}

	try {
		// Lazy load DOMPurify only when needed
		domPurifyModule ??= await import('isomorphic-dompurify');

		const DOMPurify = domPurifyModule.default;

		// Conservative sanitization configuration for markdown
		// Allows common HTML tags that might be in markdown but strips dangerous ones
		const sanitized = DOMPurify.sanitize(markdown, {
			// Allow common markdown-compatible HTML tags
			ALLOWED_TAGS: [
				'p',
				'div',
				'span',
				'br',
				'strong',
				'b',
				'em',
				'i',
				'u',
				'code',
				'pre',
				'blockquote',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'ul',
				'ol',
				'li',
				'a',
				'img',
				'hr',
				'del',
				'ins',
				'sup',
				'sub',
				'mark',
				'small',
			],
			// Allow safe attributes
			ALLOWED_ATTR: [
				'href',
				'title',
				'alt',
				'src',
				'width',
				'height',
				'target',
				'rel',
				'class',
			],
			// Additional security measures
			ALLOW_DATA_ATTR: false,
			ALLOW_UNKNOWN_PROTOCOLS: false,
			SANITIZE_DOM: true,
			// Remove any script-like content
			FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
			FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
		});

		return sanitized;
	} catch (error) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Failed to sanitize markdown content',
			cause: error,
		});
	}
}

/**
 * Sanitizes multiple markdown fields in block data
 * Used for blocks that may contain multiple markdown fields
 */
export async function sanitizeBlockMarkdown<T extends Record<string, unknown>>(
	data: T,
	markdownFields: (keyof T)[],
): Promise<T> {
	const sanitizedData = { ...data };

	for (const field of markdownFields) {
		const value = sanitizedData[field];
		if (typeof value === 'string' && value.length > 0) {
			sanitizedData[field] = (await sanitizeMarkdown(value)) as T[keyof T];
		}
	}

	return sanitizedData;
}
