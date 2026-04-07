import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface WikiPage {
	slug: string;
	title: string;
	description: string;
	category: string;
	lastUpdated: string;
	content: string;
}

const pagesDirectory = path.join(process.cwd(), 'src/app/wiki/_pages');

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
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const { data, content } = matter(fileContents);

		const frontmatter = data as {
			title?: string;
			description?: string;
			category?: string;
			lastUpdated?: string;
		};

		return {
			slug,
			title: frontmatter.title ?? 'Untitled',
			description: frontmatter.description ?? '',
			category: frontmatter.category ?? 'General',
			lastUpdated: frontmatter.lastUpdated ?? new Date().toISOString(),
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
		if (!grouped[category]) {
			grouped[category] = [];
		}
		grouped[category].push(page);
	}

	return grouped;
}
