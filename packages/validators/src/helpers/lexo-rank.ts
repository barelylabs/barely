import { LexoRank } from 'lexorank';

export const lexoFirst = () => LexoRank.middle().toString();

export const lexoMiddle = (a: string, b?: string) => {
	if (!b) {
		return LexoRank.parse(a).genNext().toString();
	}
	return LexoRank.parse(a).between(LexoRank.parse(b)).toString();
};