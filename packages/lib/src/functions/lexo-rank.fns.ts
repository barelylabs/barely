import { LexoRank } from 'lexorank';

export function generateLexoRank(params: {
	prev: string | null;
	next: string | null;
}): string {
	const { prev, next } = params;

	if (!prev && !next) {
		// First item
		return LexoRank.middle().toString();
	}

	if (prev && !next) {
		// Last item - generate after prev
		return LexoRank.parse(prev).genNext().toString();
	}

	if (!prev && next) {
		// First item when next exists - generate before next
		return LexoRank.parse(next).genPrev().toString();
	}

	// Between two items - we've already checked that both exist
	// TypeScript needs explicit type guards
	if (prev && next) {
		return LexoRank.parse(prev).between(LexoRank.parse(next)).toString();
	}

	// This should never happen given our checks above
	throw new Error('Invalid state: both prev and next are required for between operation');
}
