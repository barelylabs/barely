import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	author: string;
	authorAvatar?: string;
	tags: string[];
	excerpt: string;
	content: string;
}

// Author avatar mapping
const authorAvatars: Record<string, string> = {
	'Barely Sparrow':
		'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
	'Dr. Sarah Chen':
		'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
	'Marcus Rivera':
		'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
};

const postsDirectory = path.join(process.cwd(), 'src/app/blog/_posts');

export function getPostSlugs() {
	try {
		const files = fs.readdirSync(postsDirectory);
		return files
			.filter(file => file.endsWith('.mdx'))
			.map(file => file.replace(/\.mdx$/, ''));
	} catch (error) {
		console.error(`Failed to read posts directory: ${postsDirectory}`, error);
		return [];
	}
}

export function getPostBySlug(slug: string): BlogPost | null {
	try {
		const fullPath = path.join(postsDirectory, `${slug}.mdx`);
		const fileContents = fs.readFileSync(fullPath, 'utf8');
		const { data, content } = matter(fileContents);

		// Type the data from gray-matter
		const frontmatter = data as {
			title?: string;
			date?: string;
			author?: string;
			tags?: string[];
			excerpt?: string;
		};

		const author = frontmatter.author ?? 'Barely Sparrow';

		return {
			slug,
			title: frontmatter.title ?? 'Untitled',
			date: frontmatter.date ?? new Date().toISOString(),
			author,
			authorAvatar: authorAvatars[author] ?? authorAvatars['Barely Sparrow'],
			tags: frontmatter.tags ?? [],
			excerpt: frontmatter.excerpt ?? '',
			content,
		};
	} catch (error) {
		console.error(`Failed to read post with slug: ${slug}`, error);
		return null;
	}
}

export function getAllPosts(): BlogPost[] {
	const slugs = getPostSlugs();
	const posts = slugs
		.map(slug => getPostBySlug(slug))
		.filter((post): post is BlogPost => post !== null)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return posts;
}
