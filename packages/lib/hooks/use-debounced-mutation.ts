// import { useCallback, useEffect, useMemo, useRef } from 'react';

// import { UseMutateFunction } from '@tanstack/react-query';
// import deepEqual from 'fast-deep-equal';
// import { FieldAtom, useFieldActions, useFieldValue } from 'form-atoms';
// import { PrimitiveAtom, useAtom } from 'jotai';

// function useDebouncedMutation<
// 	TState,
// 	TMutateInput,
// 	TMutateOutput,
// 	TError,
// 	TContext,
// >(props: {
// 	atom: PrimitiveAtom<TState>;
// 	currentQueryValue: () => TState | undefined;
// 	mutateInput: (input: TState) => TMutateInput;
// 	mutate: UseMutateFunction<TMutateOutput, TError, TMutateInput, TContext>;
// }) {
// 	const [draft, setDraft] = useAtom(props.atom);

// 	const draftMutateInput = props.mutateInput(draft);

// 	const draftRef = useRef<TMutateInput | undefined>();
// 	draftRef.current = draftMutateInput;

// 	// return a stable save function
// 	const save = useCallback(() => {
// 		if (draftRef.current === undefined) return;
// 		props.mutate(draftRef.current);
// 	}, [props.mutate]);

// 	// memoize a debounced save function
// 	// const saveDebounced = useMemo(() => {
// 	// 	return debounce(save, 500);
// 	// }, [save]);

// 	// clean up saveDebounced on unmount to avoid memory leaks
// 	useEffect(() => {
// 		const prevSaveDebounced = saveDebounced;
// 		return () => prevSaveDebounced.cancel();
// 	}, [saveDebounced]);

// 	// call saveDebounced when draft changes

// 	const prevQueryValueRef = useRef<TState>();
// 	prevQueryValueRef.current = props.currentQueryValue();

// 	useEffect(() => {
// 		console.log('draft or savedebounced changed');

// 		if (!deepEqual(draft, prevQueryValueRef.current)) {
// 			console.log('draft changed');
// 			saveDebounced();
// 		}
// 	}, [draft, saveDebounced]);

// 	return [draft, setDraft] as const;
// }

// function useDebouncedFieldMutation<
// 	TState,
// 	TMutateInput,
// 	TMutateOutput,
// 	TError,
// 	TContext,
// >(props: {
// 	atom: FieldAtom<TState>;
// 	currentQueryValue: () => TState | undefined;
// 	mutateInput: (input: TState) => TMutateInput;
// 	mutate: UseMutateFunction<TMutateOutput, TError, TMutateInput, TContext>;
// }) {
// 	const fieldActions = useFieldActions(props.atom);

// 	const draft = useFieldValue(props.atom);
// 	// eslint-disable-next-line @typescript-eslint/unbound-method
// 	const setDraft = fieldActions.setValue;
// 	const draftMutateInput = props.mutateInput(draft);

// 	const draftRef = useRef<TMutateInput | undefined>();
// 	draftRef.current = draftMutateInput;

// 	// return a stable save function
// 	const save = useCallback(() => {
// 		if (draftRef.current === undefined) return;
// 		props.mutate(draftRef.current);
// 	}, [props.mutate]);

// 	// memoize a debounced save function
// 	const saveDebounced = useMemo(() => {
// 		return debounce(save, 500);
// 	}, [save]);

// 	// clean up saveDebounced on unmount to avoid memory leaks
// 	useEffect(() => {
// 		const prevSaveDebounced = saveDebounced;
// 		return () => prevSaveDebounced.cancel();
// 	}, [saveDebounced]);

// 	// call saveDebounced when draft changes
// 	const prevQueryValueRef = useRef<TState>();
// 	prevQueryValueRef.current = props.currentQueryValue();

// 	useEffect(() => {
// 		console.log('draft or savedebounced changed');

// 		if (!deepEqual(draft, prevQueryValueRef.current)) {
// 			console.log('draft changed');
// 			saveDebounced();
// 		}
// 	}, [draft, saveDebounced]);

// 	return [draft, setDraft] as const;
// }

// export { useDebouncedMutation, useDebouncedFieldMutation };
