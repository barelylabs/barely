import type { Selection } from 'react-aria-components';
import { useCallback } from 'react';
import { querySelectionSchema } from '@barely/validators';
import { parseAsBoolean, parseAsJson, parseAsString, useQueryStates } from 'nuqs';

import type {
	BaseResourceFilters,
	ResourceSearchParamsConfig,
	ResourceSearchParamsReturn,
} from './resource-hooks.types';

/**
 * Factory function to create a resource-specific search params hook
 * that manages all state via URL parameters (via nuqs)
 */
export function createResourceSearchParamsHook<
	TFilters extends BaseResourceFilters = BaseResourceFilters,
>(config?: ResourceSearchParamsConfig<TFilters>) {
	return function useResourceSearchParams(): ResourceSearchParamsReturn<TFilters> {
		// URL state management with nuqs (including modal states)
		const [params, setParams] = useQueryStates({
			search: parseAsString.withDefault(''),
			selectedIds: parseAsJson(v => querySelectionSchema.optional().parse(v)),
			showArchived: parseAsBoolean.withDefault(false),
			showDeleted: parseAsBoolean.withDefault(false),
			// Modal states in URL
			showCreateModal: parseAsBoolean.withDefault(false),
			showUpdateModal: parseAsBoolean.withDefault(false),
			showArchiveModal: parseAsBoolean.withDefault(false),
			showDeleteModal: parseAsBoolean.withDefault(false),
			...config?.additionalParsers,
		});

		// Extract filters and modal states from params
		const {
			selectedIds,
			showCreateModal,
			showUpdateModal,
			showArchiveModal,
			showDeleteModal,
			...filters
		} = params;

		// Convert selectedIds to Selection type
		const selection: Selection =
			!params.selectedIds ? new Set()
			: params.selectedIds === 'all' ? 'all'
			: new Set(params.selectedIds);

		// Selection setter that syncs with URL
		const setSelection = useCallback(
			(selection: Selection) => {
				if (selection === 'all') return;
				if (selection.size === 0) return setParams({ selectedIds: null });
				return setParams({
					selectedIds: Array.from(selection).map(key => key.toString()),
				});
			},
			[setParams],
		);

		// Clear all filters
		const clearAllFilters = () => setParams(null);

		// Base actions
		const setSearch = (search: string) => setParams({ search });
		const toggleArchived = () => setParams(p => ({ showArchived: !p.showArchived }));
		const toggleDeleted = () => setParams(p => ({ showDeleted: !p.showDeleted }));

		// Modal state setters
		const setShowCreateModal = (show: boolean) => setParams({ showCreateModal: show });
		const setShowUpdateModal = (show: boolean) => setParams({ showUpdateModal: show });
		const setShowArchiveModal = (show: boolean) => setParams({ showArchiveModal: show });
		const setShowDeleteModal = (show: boolean) => setParams({ showDeleteModal: show });

		// Process additional actions if provided
		const additionalActions =
			config?.additionalActions ?
				Object.entries(config.additionalActions).reduce<Record<string, unknown>>(
					(acc, [key, actionCreator]) => {
						// Pass setParams to each action creator
						acc[key] = actionCreator(setParams);
						return acc;
					},
					{},
				)
			:	{};

		return {
			// URL state
			filters: filters as TFilters,
			selectedIds: selectedIds ?? null,
			selection,
			setSelection,
			clearAllFilters,
			setSearch,
			toggleArchived,
			toggleDeleted,

			// Modal state
			showCreateModal,
			setShowCreateModal,
			showUpdateModal,
			setShowUpdateModal,
			showArchiveModal,
			setShowArchiveModal,
			showDeleteModal,
			setShowDeleteModal,

			// Additional actions from config
			...additionalActions,
		};
	};
}
