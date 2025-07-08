'use client';

import type * as z from 'zod/v4';
import { useCallback, useEffect, useOptimistic, useRef, useTransition } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useTypedOptimisticParams<T extends z.ZodObject<any, any>>(
	schema: T,
	options?: {
		replaceOnChange?: boolean;
	},
) {
	type Output = z.infer<typeof schema>;

	const router = useRouter();
	const pathname = usePathname();
	const currentParams = useParams();
	const [isPending, startTransition] = useTransition();

	// Parse current params with the schema
	const parsedParams = schema.safeParse(currentParams);

	// Use parsed data if successful, otherwise undefined for each field
	const initialParams = parsedParams.success ? parsedParams.data : undefined;

	const [optimisticParams, setOptimisticParams] = useOptimistic<Output | undefined>(
		initialParams,
	);

	// Use a ref to track pending navigation to avoid StrictMode issues
	const pendingNavigationRef = useRef<{
		path: string;
		params: Output;
		completed: boolean;
		onAfterNavigate?: (params: Output) => void | Promise<void>;
	} | null>(null);

	// Watch for navigation completion
	useEffect(() => {
		const pending = pendingNavigationRef.current;

		if (pending && pathname === pending.path && !pending.completed) {
			// Mark as completed to prevent double execution in StrictMode
			pending.completed = true;

			// Navigation completed!
			if (pending.onAfterNavigate) {
				void pending.onAfterNavigate(pending.params);
			}

			// Clear the pending navigation
			pendingNavigationRef.current = null;
		}
	}, [pathname]);

	// Helper function to build path with new params
	const buildPathWithParams = useCallback(
		(newParams: Output): string => {
			let newPath = pathname;

			// For each param in newParams, replace it in the path
			Object.entries(newParams).forEach(([paramKey, paramValue]) => {
				if (paramValue == null) return;

				// Handle different types of values
				let stringValue: string;
				if (typeof paramValue === 'string') {
					stringValue = paramValue;
				} else if (typeof paramValue === 'number' || typeof paramValue === 'boolean') {
					stringValue = String(paramValue);
				} else {
					// For objects/arrays, use JSON.stringify or skip
					console.warn(
						`Cannot stringify param "${paramKey}" of type ${typeof paramValue}`,
					);
					return;
				}

				const currentValue = currentParams[paramKey] as string;

				// If the param exists in the current path, replace it
				if (currentValue && pathname.includes(currentValue)) {
					newPath = newPath.replace(currentValue, stringValue);
				}
			});

			return newPath;
		},
		[pathname, currentParams],
	);

	// Get the path that would be navigated to without actually navigating
	const getSetParamPath = useCallback(
		function getSetParamPath<K extends keyof Output>(key: K, value: Output[K]) {
			const currentOptimisticParams = optimisticParams ?? ({} as Output);
			const newParams = { ...currentOptimisticParams, [key]: value };
			return buildPathWithParams(newParams);
		},
		[optimisticParams, buildPathWithParams],
	);

	const setParam = useCallback(
		function setParam<K extends keyof Output>(
			key: K,
			value: Output[K],
			callbacks?: {
				onBeforeNavigate?: (params: Output) => void | Promise<void>;
				onAfterNavigate?: (params: Output) => void | Promise<void>;
			},
		) {
			startTransition(async () => {
				// Update optimistic state immediately
				const currentOptimisticParams = optimisticParams ?? ({} as Output);
				const newParams = { ...currentOptimisticParams, [key]: value };
				setOptimisticParams(newParams);

				// Call pre-navigation hook (e.g., to set query cache)
				if (callbacks?.onBeforeNavigate) {
					await callbacks.onBeforeNavigate(newParams);
				}

				// Build and navigate to new path
				const newPath = buildPathWithParams(newParams);

				// Track this navigation for completion
				if (callbacks?.onAfterNavigate) {
					pendingNavigationRef.current = {
						path: newPath,
						params: newParams,
						completed: false,
						onAfterNavigate: callbacks.onAfterNavigate,
					};
				}

				if (options?.replaceOnChange) {
					router.replace(newPath, { scroll: false });
				} else {
					router.push(newPath, { scroll: false });
				}
			});
		},
		[optimisticParams, buildPathWithParams, router, options],
	);

	const setParams = useCallback(
		function setParams(
			newParams: Partial<Output>,
			callbacks?: {
				onBeforeNavigate?: (params: Output) => void | Promise<void>;
				onAfterNavigate?: (params: Output) => void | Promise<void>;
			},
		) {
			startTransition(async () => {
				// Update optimistic state with all new params
				const currentOptimisticParams = optimisticParams ?? ({} as Output);
				const updatedParams = { ...currentOptimisticParams, ...newParams };
				setOptimisticParams(updatedParams);

				// Call pre-navigation hook
				if (callbacks?.onBeforeNavigate) {
					await callbacks.onBeforeNavigate(updatedParams);
				}

				// Build and navigate to new path
				const newPath = buildPathWithParams(updatedParams);

				// Track this navigation for completion
				if (callbacks?.onAfterNavigate) {
					pendingNavigationRef.current = {
						path: newPath,
						params: updatedParams,
						completed: false,
						onAfterNavigate: callbacks.onAfterNavigate,
					};
				}

				if (options?.replaceOnChange) {
					router.replace(newPath, { scroll: false });
				} else {
					router.push(newPath, { scroll: false });
				}
			});
		},
		[optimisticParams, buildPathWithParams, router, options],
	);

	return {
		params: optimisticParams,
		currentParams: parsedParams.success ? parsedParams.data : undefined,
		pending: isPending,
		getSetParamPath,
		setParam,
		setParams,
		isValid: parsedParams.success,
	} as const;
}
