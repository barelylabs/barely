import {
	formatIncompletePhoneNumber,
	getCountryCallingCode,
	isPossiblePhoneNumber as isPossible,
	parseDigits,
	parsePhoneNumber,
} from 'libphonenumber-js/min';

type CountryCode = 'US' | 'CA';

const parseIncompletePhoneNumber = ({
	input,
	countryCode,
}: {
	input: string;
	countryCode: CountryCode;
}) => {
	const countryCallingCode = getCountryCallingCode(countryCode);
	let digits = parseDigits(input);

	if (!digits.startsWith(countryCallingCode)) {
		digits = countryCallingCode + digits;
	}

	const incompletePhoneNubmer = '+' + formatIncompletePhoneNumber(digits, countryCode);
	console.log('incompletePhoneNubmer', incompletePhoneNubmer);
	return incompletePhoneNubmer;
};

const isPossiblePhoneNumber = (input: string) => {
	return isPossible('+' + parseDigits(input));
};

const formatInternational = (input: string) => {
	return parsePhoneNumber(input)?.formatInternational();
};

const parseForDb = (input: string) => {
	return '+' + parseDigits(input);
};

export {
	parseIncompletePhoneNumber,
	parsePhoneNumber,
	isPossiblePhoneNumber,
	formatInternational,
	parseForDb,
};
