import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod/v4';

export interface WikiPage {
	slug: string;
	title: string;
	description: string;
	category: string;
	lastUpdated: string;
	content: string;
}

const pagesDirectory = path.join(process.cwd(), 'src/app/wiki/_pages');
const resolvedPagesDirectory = path.resolve(pagesDirectory);

const frontmatterSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	category: z.string().optional(),
	lastUpdated: z.union([z.string(), z.date()]).optional(),
});

export function getWikiSlugs() {
	try {
		const files = fs.readdirSync(pagesDirectory);
		return files
			.filter(file => file.endsWith('.mdx'))
			.map(file => file.replace(/\.mdx$/, ''));
	} catch (error) {
		console.error(`Failed to read wiki directory: ${pagesDirectory}`, error);
		return [];
	}
}

export function getWikiPageBySlug(slug: string): WikiPage | null {
	try {
		const fullPath = path.join(pagesDirectory, `${slug}.mdx`);
		const resolvedPath = path.resolve(fullPath);
		if (!resolvedPath.startsWith(resolvedPagesDirectory + path.sep)) {
			return null;
		}
		const fileContents = fs.readFileSync(resolvedPath, 'utf8');
		const { data, content } = matter(fileContents);

		const result = frontmatterSchema.safeParse(data);
		if (!result.success) {
			console.error('Invalid frontmatter for slug:', slug, result.error);
			return null;
		}
		const frontmatter = result.data;
		const rawLastUpdated = frontmatter.lastUpdated;
		const lastUpdated =
			rawLastUpdated instanceof Date ?
				rawLastUpdated.toISOString()
			:	(rawLastUpdated ?? new Date().toISOString());

		return {
			slug,
			title: frontmatter.title ?? 'Untitled',
			description: frontmatter.description ?? '',
			category: frontmatter.category ?? 'General',
			lastUpdated,
			content,
		};
	} catch (error) {
		console.error(`Failed to read wiki page with slug: ${slug}`, error);
		return null;
	}
}

export function getAllWikiPages(): WikiPage[] {
	const slugs = getWikiSlugs();
	return slugs
		.map(slug => getWikiPageBySlug(slug))
		.filter((page): page is WikiPage => page !== null)
		.sort((a, b) => a.title.localeCompare(b.title));
}

export function getWikiPagesByCategory(): Record<string, WikiPage[]> {
	const pages = getAllWikiPages();
	const grouped: Record<string, WikiPage[]> = {};

	for (const page of pages) {
		const category = page.category;
		grouped[category] ??= [];
		grouped[category].push(page);
	}

	return grouped;
}
