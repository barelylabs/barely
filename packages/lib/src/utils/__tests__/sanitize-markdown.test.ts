import { describe, expect, it } from 'vitest';

import { sanitizeBlockMarkdown, sanitizeMarkdown } from '../sanitize-markdown';

describe('sanitizeMarkdown', () => {
	it('should allow safe markdown content', async () => {
		const safeMarkdown =
			'This is **bold** text with *italic* and [a link](https://example.com)';
		const result = await sanitizeMarkdown(safeMarkdown);
		expect(result).toBe(safeMarkdown);
	});

	it('should remove script tags', async () => {
		const maliciousMarkdown = 'Hello <script>alert("xss")</script> world';
		const result = await sanitizeMarkdown(maliciousMarkdown);
		expect(result).toBe('Hello  world');
	});

	it('should remove event handlers', async () => {
		const maliciousMarkdown = '<div onclick="alert(\'xss\')">Click me</div>';
		const result = await sanitizeMarkdown(maliciousMarkdown);
		expect(result).toBe('<div>Click me</div>');
	});

	it('should allow safe HTML tags commonly used in markdown', async () => {
		const safeMarkdown =
			'<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>';
		const result = await sanitizeMarkdown(safeMarkdown);
		expect(result).toBe(safeMarkdown);
	});

	it('should remove dangerous HTML tags', async () => {
		const dangerousMarkdown = 'Text <iframe src="evil.com"></iframe> more text';
		const result = await sanitizeMarkdown(dangerousMarkdown);
		expect(result).toBe('Text  more text');
	});

	it('should handle empty or null input', async () => {
		expect(await sanitizeMarkdown('')).toBe('');
		expect(await sanitizeMarkdown(null as unknown as string)).toBe(null);
		expect(await sanitizeMarkdown(undefined as unknown as string)).toBe(undefined);
	});
});

describe('sanitizeBlockMarkdown', () => {
	it('should sanitize specified markdown fields', async () => {
		const blockData = {
			type: 'markdown',
			title: 'Safe title',
			markdown: 'Safe **markdown** <script>alert("xss")</script>',
			otherField: 'unchanged',
		};

		const result = await sanitizeBlockMarkdown(blockData, ['markdown']);

		expect(result.markdown).toBe('Safe **markdown** ');
		expect(result.title).toBe('Safe title');
		expect(result.otherField).toBe('unchanged');
	});

	it('should handle multiple markdown fields', async () => {
		const blockData = {
			markdown: '<script>evil</script>content',
			description: '<iframe>bad</iframe>description',
			title: 'Safe title',
		};

		const result = await sanitizeBlockMarkdown(blockData, ['markdown', 'description']);

		expect(result.markdown).toBe('content');
		expect(result.description).toBe('description');
		expect(result.title).toBe('Safe title');
	});

	it('should skip non-string fields', async () => {
		const blockData = {
			markdown: null,
			description: undefined,
			count: 42,
			active: true,
		};

		const result = await sanitizeBlockMarkdown(blockData, ['markdown', 'description']);

		expect(result.markdown).toBe(null);
		expect(result.description).toBe(undefined);
		expect(result.count).toBe(42);
		expect(result.active).toBe(true);
	});
});
