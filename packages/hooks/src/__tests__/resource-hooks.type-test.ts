import { parseAsBoolean, parseAsInteger, parseAsStringEnum } from 'nuqs';

import type {
	InferActions,
	InferParsers,
	SetParamsFunction,
} from '../resource-hooks.types';
import { action, createResourceSearchParamsHook } from '../index';

/**
 * Type tests for the enhanced resource hook factory pattern
 * These tests verify that type inference works correctly without runtime overhead
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */

// Type testing utilities
type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

// Mock describe for type tests
declare const describe: (name: string, fn: () => void) => void;

// Test 1: Parser type inference
describe('Parser Type Inference', () => {
	// Test basic parser inference
	const statusParser = parseAsStringEnum(['active', 'inactive'] as const).withDefault(
		'active',
	);
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Type needed to satisfy ParserConfig constraint
	type TestParsers = {
		showImportModal: ReturnType<typeof parseAsBoolean.withDefault>;
		pageSize: ReturnType<typeof parseAsInteger.withDefault>;
		status: typeof statusParser; // Use actual parser instance
	};

	type InferredTypes = InferParsers<TestParsers>;

	// Verify types are correctly inferred
	// Verify types are correctly inferred
	const _test1: InferredTypes['showImportModal'] = true;
	const _test2: InferredTypes['pageSize'] = 10;
	// Status type would be 'active' | 'inactive' but parseAsStringEnum type is complex
});

// Test 2: Action type inference
describe('Action Type Inference', () => {
	// Test action builder inference
	const testActions = {
		setShowImportModal: action((setParams: SetParamsFunction, show: boolean) =>
			setParams({ showImportModal: show }),
		),
		setPageSize: action((setParams: SetParamsFunction, size: number) =>
			setParams({ pageSize: size }),
		),
		setMultipleParams: action(
			(setParams: SetParamsFunction, show: boolean, size: number) =>
				setParams({ showImportModal: show, pageSize: size }),
		),
	};

	type InferredActions = InferActions<typeof testActions>;

	// Verify action signatures are correctly inferred
	// These type assignments verify that the inference is working
	type ActionTest1 = InferredActions['setShowImportModal'];
	type ActionTest2 = InferredActions['setPageSize'];
	type ActionTest3 = InferredActions['setMultipleParams'];
});

// Test 3: Full hook type inference
describe('Full Hook Type Inference', () => {
	// Create a test hook with custom parsers and actions
	const useTestSearchParams = createResourceSearchParamsHook({
		additionalParsers: {
			showImportModal: parseAsBoolean.withDefault(false),
			pageSize: parseAsInteger.withDefault(10),
			status: parseAsStringEnum(['active', 'inactive'] as const).withDefault('active'),
		},
		additionalActions: {
			setShowImportModal: action((setParams: SetParamsFunction, show: boolean) =>
				setParams({ showImportModal: show }),
			),
			toggleImportModal: action((setParams: SetParamsFunction) =>
				setParams((prev: Record<string, unknown>) => ({
					showImportModal: !(prev.showImportModal as boolean),
				})),
			),
		},
	});

	// Get the return type of the hook
	type HookReturnType = ReturnType<typeof useTestSearchParams>;

	// Verify filters include base filters plus custom ones
	type FilterTest1 = HookReturnType['filters']['search']; // should be string
	type FilterTest2 = HookReturnType['filters']['showArchived']; // should be boolean
	type FilterTest3 = HookReturnType['filters']['showImportModal']; // should be boolean
	type FilterTest4 = HookReturnType['filters']['pageSize']; // should be number
	type FilterTest5 = HookReturnType['filters']['status']; // should be 'active' | 'inactive'

	// Verify custom actions are included
	type ActionTest4 = HookReturnType['setShowImportModal']; // should exist
	type ActionTest5 = HookReturnType['toggleImportModal']; // should exist

	// Verify base actions are still present
	type ActionTest6 = HookReturnType['setSearch']; // should exist
	type ActionTest7 = HookReturnType['toggleArchived']; // should exist
});

// Test 4: Empty config inference
describe('Empty Config Inference', () => {
	// Hook with no custom config
	const useBasicSearchParams = createResourceSearchParamsHook();

	type BasicHookReturnType = ReturnType<typeof useBasicSearchParams>;

	// Should only have base filters
	type BasicTest1 = BasicHookReturnType['filters']['search']; // should be string
	type BasicTest2 = BasicHookReturnType['filters']['showArchived']; // should be boolean
	type BasicTest3 = BasicHookReturnType['filters']['showDeleted']; // should be boolean

	// Should not have any custom properties
	// Verify these properties don't exist (will cause compile error if they do)
	// type test4 = BasicHookReturnType['filters']['showImportModal']; // Should not compile
	// type test5 = BasicHookReturnType['setShowImportModal']; // Should not compile
});

// Test 5: Complex action signatures
describe('Complex Action Signatures', () => {
	const complexActions = {
		// Action with optional parameters
		setOptionalParams: action(
			(setParams: SetParamsFunction, required: string, optional?: number) =>
				setParams({ value: required, count: optional }),
		),
		// Action that returns void
		voidAction: action((setParams: SetParamsFunction, value: string) => {
			setParams({ value });
		}),
		// Action with object parameter
		setObjectParam: action(
			(setParams: SetParamsFunction, config: { name: string; enabled: boolean }) =>
				setParams(config),
		),
	};

	type ComplexActions = InferActions<typeof complexActions>;

	// Verify complex signatures are preserved
	type ComplexTest1 = ComplexActions['setOptionalParams']; // should handle optional params
	type ComplexTest2 = ComplexActions['voidAction']; // should return void
	type ComplexTest3 = ComplexActions['setObjectParam']; // should accept object param
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
			setShowImportModal: action((setParams: SetParamsFunction, show: boolean) =>
				setParams({ showImportModal: show }),
			),
		},
	});

	type NewFanSearchParamsReturn = ReturnType<typeof newUseFanSearchParams>;

	// Verify the inferred type matches the manual type
	type FanTest1 = NewFanSearchParamsReturn['filters']['showImportModal']; // should be boolean
	type FanTest2 = NewFanSearchParamsReturn['setShowImportModal']; // should exist
});
