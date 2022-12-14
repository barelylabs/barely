import {  ZodOptional, ZodString, ZodTransformer } from 'zod';

export function toNull(value: any) {
	return value ?? null;
}


