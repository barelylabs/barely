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
  'Barely Sparrow': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'Dr. Sarah Chen': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  'Marcus Rivera': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
};

const postsDirectory = path.join(process.cwd(), 'src/app/blog/_posts');

export function getPostSlugs() {
  try {
    const files = fs.readdirSync(postsDirectory);
    return files
      .filter(file => file.endsWith('.mdx'))
      .map(file => file.replace(/\.mdx$/, ''));
  } catch {
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const author = data.author || 'Barely Sparrow';
    
    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString(),
      author,
      authorAvatar: authorAvatars[author] || authorAvatars['Barely Sparrow'],
      tags: data.tags || [],
      excerpt: data.excerpt || '',
      content,
    };
  } catch {
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