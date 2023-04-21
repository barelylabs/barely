const fullName = (firstName?: string | null, lastName?: string | null) => {
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
};

const initials = (string: string) => {
	return string
		.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase();
};

export { fullName, initials };
