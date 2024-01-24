import { LexoRank } from 'lexorank';

export function afterLast(lastLexoRank: string) {
	const lastLexo = LexoRank.parse(lastLexoRank);
	return lastLexo.between(LexoRank.max()).toString();
}

export function beforeFirst(firstLexoRank: string) {
	const firstLexo = LexoRank.parse(firstLexoRank);
	return firstLexo.between(LexoRank.min()).toString();
}

export function between(beforeLexoRank?: string, afterLexoRank?: string) {
	const beforeLexo = beforeLexoRank ? LexoRank.parse(beforeLexoRank) : LexoRank.min();
	const afterLexo = afterLexoRank ? LexoRank.parse(afterLexoRank) : LexoRank.max();
	const between = beforeLexo.between(afterLexo).toString();
	return between;
}

export function middle() {
	return LexoRank.middle().toString();
}
