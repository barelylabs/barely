export function parseFullName(fullName: string) {
	const [firstName, ...rest] = fullName.split(' ');
	const lastName = rest.join(' ');

	return { firstName: firstName ?? '', lastName: lastName };
}

export function fullNameToFirstAndLast(
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

export function initials(string: string) {
	return string
		.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase();
}
