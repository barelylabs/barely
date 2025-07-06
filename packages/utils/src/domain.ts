import slugify from '@sindresorhus/slugify';

export function generateDomainFromName(name: string, ccTLDs: Set<string>) {
	const normalizedName = slugify(name, { separator: '' });

	if (normalizedName.length < 3) {
		return '';
	}
	if (ccTLDs.has(normalizedName.slice(-2))) {
		return `${normalizedName.slice(0, -2)}.${normalizedName.slice(-2)}`;
	}
	// remove vowels
	const noVowels = normalizedName.replace(/[aeiou]/gi, '');
	if (noVowels.length >= 3 && ccTLDs.has(noVowels.slice(-2))) {
		return `${noVowels.slice(0, -2)}.${noVowels.slice(-2)}`;
	}

	const shortestString = [normalizedName, noVowels].reduce((a, b) =>
		a.length < b.length ? a : b,
	);

	return `${shortestString}.to`;
}

export function getSubdomain(name: string, apexName: string) {
	if (name === apexName) return null;
	return name.slice(0, name.length - apexName.length - 1);
}
