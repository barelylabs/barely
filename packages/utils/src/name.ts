export function getFirstAndLastName(p: {
	fullName?: string | null;
	firstName?: string | null;
	lastName?: string | null;
}) {
	const firstName = p.firstName ?? parseFullName(p.fullName ?? '').firstName;
	const lastName = p.lastName ?? parseFullName(p.fullName ?? '').lastName;

	return { firstName, lastName };
}

export function parseFullName(fullName: string) {
	const [firstName, ...rest] = fullName.split(' ');
	const lastName = rest.join(' ');

	return { firstName: firstName ?? '', lastName: lastName };
}

export function getFullNameFromFirstAndLast(
	firstName?: string | null,
	lastName?: string | null,
) {
	if (firstName && !lastName) {
		return firstName;
	}

	if (!firstName && lastName) {
		return lastName;
	}

	if (firstName && lastName) {
		return firstName + ' ' + lastName;
	}

	return '';
}

export function getFullName({
	firstName,
	lastName,
	fullName,
}: {
	firstName?: string | null;
	lastName?: string | null;
	fullName?: string | null;
}) {
	if (fullName && fullName.length > 0) return fullName;
	return getFullNameFromFirstAndLast(firstName, lastName);
}

export function initials(string: string) {
	return string
		.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase();
}
