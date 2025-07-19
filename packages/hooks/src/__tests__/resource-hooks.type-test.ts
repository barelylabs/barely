/**
 * Type tests for the enhanced resource hook factory pattern
 * These tests verify that type inference works correctly without runtime overhead
 */

import type { Equal, Expect } from 'type-testing';
import { parseAsBoolean, parseAsInteger, parseAsStringEnum } from 'nuqs';

import type { InferActions, InferParsers } from '../resource-hooks.types';
import { action, createResourceSearchParamsHook } from '../index';

// Test 1: Parser type inference
describe('Parser Type Inference', () => {
	// Test basic parser inference
	type TestParsers = {
		showImportModal: ReturnType<typeof parseAsBoolean.withDefault>;
		pageSize: ReturnType<typeof parseAsInteger.withDefault>;
		status: ReturnType<typeof parseAsStringEnum<['active', 'inactive']>>;
	};

	type InferredTypes = InferParsers<TestParsers>;

	// Verify types are correctly inferred
	type test1 = Expect<Equal<InferredTypes['showImportModal'], boolean>>;
	type test2 = Expect<Equal<InferredTypes['pageSize'], number>>;
	type test3 = Expect<Equal<InferredTypes['status'], 'active' | 'inactive'>>;
});

// Test 2: Action type inference
describe('Action Type Inference', () => {
	// Test action builder inference
	const testActions = {
		setShowImportModal: action((setParams, show: boolean) =>
			setParams({ showImportModal: show }),
		),
		setPageSize: action((setParams, size: number) => setParams({ pageSize: size })),
		setMultipleParams: action((setParams, show: boolean, size: number) =>
			setParams({ showImportModal: show, pageSize: size }),
		),
	};

	type InferredActions = InferActions<typeof testActions>;

	// Verify action signatures are correctly inferred
	type test1 = Expect<
		Equal<
			InferredActions['setShowImportModal'],
			(show: boolean) => Promise<URLSearchParams> | undefined
		>
	>;
	type test2 = Expect<
		Equal<
			InferredActions['setPageSize'],
			(size: number) => Promise<URLSearchParams> | undefined
		>
	>;
	type test3 = Expect<
		Equal<
			InferredActions['setMultipleParams'],
			(show: boolean, size: number) => Promise<URLSearchParams> | undefined
		>
	>;
});

// Test 3: Full hook type inference
describe('Full Hook Type Inference', () => {
	// Create a test hook with custom parsers and actions
	const useTestSearchParams = createResourceSearchParamsHook({
		additionalParsers: {
			showImportModal: parseAsBoolean.withDefault(false),
			pageSize: parseAsInteger.withDefault(10),
			status: parseAsStringEnum(['active', 'inactive']).withDefault('active'),
		},
		additionalActions: {
			setShowImportModal: action((setParams, show: boolean) =>
				setParams({ showImportModal: show }),
			),
			toggleImportModal: action(setParams =>
				setParams(prev => ({ showImportModal: !prev.showImportModal })),
			),
		},
	});

	// Get the return type of the hook
	type HookReturnType = ReturnType<typeof useTestSearchParams>;

	// Verify filters include base filters plus custom ones
	type test1 = Expect<Equal<HookReturnType['filters']['search'], string>>;
	type test2 = Expect<Equal<HookReturnType['filters']['showArchived'], boolean>>;
	type test3 = Expect<Equal<HookReturnType['filters']['showImportModal'], boolean>>;
	type test4 = Expect<Equal<HookReturnType['filters']['pageSize'], number>>;
	type test5 = Expect<Equal<HookReturnType['filters']['status'], 'active' | 'inactive'>>;

	// Verify custom actions are included
	type test6 = Expect<
		Equal<
			HookReturnType['setShowImportModal'],
			(show: boolean) => Promise<URLSearchParams> | undefined
		>
	>;
	type test7 = Expect<
		Equal<HookReturnType['toggleImportModal'], () => Promise<URLSearchParams> | undefined>
	>;

	// Verify base actions are still present
	type test8 = Expect<
		Equal<HookReturnType['setSearch'], (search: string) => Promise<URLSearchParams>>
	>;
	type test9 = Expect<Equal<HookReturnType['toggleArchived'], () => Promise<URLSearchParams>>>;
});

// Test 4: Empty config inference
describe('Empty Config Inference', () => {
	// Hook with no custom config
	const useBasicSearchParams = createResourceSearchParamsHook();

	type BasicHookReturnType = ReturnType<typeof useBasicSearchParams>;

	// Should only have base filters
	type test1 = Expect<Equal<BasicHookReturnType['filters']['search'], string>>;
	type test2 = Expect<Equal<BasicHookReturnType['filters']['showArchived'], boolean>>;
	type test3 = Expect<Equal<BasicHookReturnType['filters']['showDeleted'], boolean>>;

	// Should not have any custom properties
	// @ts-expect-error - showImportModal should not exist
	type test4 = BasicHookReturnType['filters']['showImportModal'];
	// @ts-expect-error - setShowImportModal should not exist
	type test5 = BasicHookReturnType['setShowImportModal'];
});

// Test 5: Complex action signatures
describe('Complex Action Signatures', () => {
	const complexActions = {
		// Action with optional parameters
		setOptionalParams: action(
			(setParams, required: string, optional?: number) =>
				setParams({ value: required, count: optional }),
		),
		// Action that returns void
		voidAction: action((setParams, value: string) => {
			setParams({ value });
		}),
		// Action with object parameter
		setObjectParam: action(
			(setParams, config: { name: string; enabled: boolean }) =>
				setParams(config),
		),
	};

	type ComplexActions = InferActions<typeof complexActions>;

	// Verify complex signatures are preserved
	type test1 = Expect<
		Equal<
			ComplexActions['setOptionalParams'],
			(required: string, optional?: number) => Promise<URLSearchParams> | undefined
		>
	>;
	type test2 = Expect<Equal<ComplexActions['voidAction'], (value: string) => void>>;
	type test3 = Expect<
		Equal<
			ComplexActions['setObjectParam'],
			(config: { name: string; enabled: boolean }) => Promise<URLSearchParams> | undefined
		>
	>;
});

// Test 6: Real-world example - Fan context migration
describe('Fan Context Migration', () => {
	// Before - with manual types
	interface OldFanSearchParamsReturn {
		filters: {
			search: string;
			showArchived: boolean;
			showDeleted: boolean;
			showImportModal: boolean;
		};
		setShowImportModal: (show: boolean) => Promise<URLSearchParams> | undefined;
		// ... other base properties
	}

	// After - with type inference
	const newUseFanSearchParams = createResourceSearchParamsHook({
		additionalParsers: {
			showImportModal: parseAsBoolean.withDefault(false),
		},
		additionalActions: {
			setShowImportModal: action((setParams, show: boolean) =>
				setParams({ showImportModal: show }),
			),
		},
	});

	type NewFanSearchParamsReturn = ReturnType<typeof newUseFanSearchParams>;

	// Verify the inferred type matches the manual type
	type test1 = Expect<
		Equal<NewFanSearchParamsReturn['filters']['showImportModal'], boolean>
	>;
	type test2 = Expect<
		Equal<
			NewFanSearchParamsReturn['setShowImportModal'],
			(show: boolean) => Promise<URLSearchParams> | undefined
		>
	>;
});

// Type testing utility types (would normally come from a type-testing library)
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
	? true
	: false;

type Expect<T extends true> = T;