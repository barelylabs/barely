import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function calcCrow(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // km
	const dLat = degToRad(lat2 - lat1);
	const dLon = degToRad(lon2 - lon1);
	const lat1Rad = degToRad(lat1);
	const lat2Rad = degToRad(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return d;
}

export function degToRad(value: number): number {
	return (value * Math.PI) / 180;
}

export function exclude<T, Key extends keyof T>(obj: T, keys: Key[]): Omit<T, Key> {
	for (const key of keys) {
		delete obj[key];
	}
	return obj;
}

export function formatDate(input: string | number): string {
	const date = new Date(input);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export function fullName(firstName?: string | null, lastName?: string | null) {
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

export function undefinedToNull<T>(value: T) {
	return value === undefined ? null : value;
}
