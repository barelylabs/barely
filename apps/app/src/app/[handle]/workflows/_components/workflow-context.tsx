'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import type { workflowFilterParamsSchema } from '@barely/lib/server/routes/workflow/workflow.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod/v4';
import {
	createContext,
	use,
	useContext,
	useOptimistic,
	useRef,
	useState,
	useTransition,
} from 'react';
import { useTypedQuery } from '@barely/lib/hooks/use-typed-query';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';
import { workflowSearchParamsSchema } from '@barely/lib/server/routes/workflow/workflow.schema';

interface WorkflowContext {
	workflows: AppRouterOutputs['workflow']['byWorkspace']['workflows'];
	workflowSelection: Selection;
	lastSelectedWorkflowId: string | undefined;
	lastSelectedWorkflow:
		| AppRouterOutputs['workflow']['byWorkspace']['workflows'][0]
		| undefined;
	setWorkflowSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateWorkflowModal: boolean;
	setShowCreateWorkflowModal: (show: boolean) => void;
	showUpdateWorkflowModal: boolean;
	setShowUpdateWorkflowModal: (show: boolean) => void;
	showArchiveWorkflowModal: boolean;
	setShowArchiveWorkflowModal: (show: boolean) => void;
	showDeleteWorkflowModal: boolean;
	setShowDeleteWorkflowModal: (show: boolean) => void;
	// filters
	filters: z.infer<typeof workflowFilterParamsSchema>;
	pendingFiltersTransition: boolean;
	setSearch: (search: string) => void;
	toggleArchived: () => void;
	clearAllFilters: () => void;
}

const WorkflowContext = createContext<WorkflowContext | undefined>(undefined);

export function WorkflowContextProvider({
	children,
	initialWorkflows,
	filters,
	selectedWorkflowIds,
}: {
	children: React.ReactNode;
	initialWorkflows: Promise<AppRouterOutputs['workflow']['byWorkspace']>;
	filters: z.infer<typeof workflowFilterParamsSchema>;
	selectedWorkflowIds: string[];
}) {
	const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
	const [showUpdateWorkflowModal, setShowUpdateWorkflowModal] = useState(false);
	const [showArchiveWorkflowModal, setShowArchiveWorkflowModal] = useState(false);
	const [showDeleteWorkflowModal, setShowDeleteWorkflowModal] = useState(false);

	const { handle } = useWorkspace();
	const { data: infiniteWorkflows } = api.workflow.byWorkspace.useQuery(
		{
			handle,
			...filters,
		},
		{
			initialData: use(initialWorkflows),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const { data, setQuery, removeByKey, removeAllQueryParams } = useTypedQuery(
		workflowSearchParamsSchema,
	);

	/* selection */
	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(selectedWorkflowIds),
	);
	const [, startSelectTransition] = useTransition();

	function setWorkflowSelection(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);

			if (selection === 'all') return;

			if (selection.size === 0) {
				return removeByKey('selectedWorkflowIds');
			}

			return setQuery(
				'selectedWorkflowIds',
				Array.from(selection).map(key => key.toString()),
			);
		});
	}

	/* filters */
	const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters);
	const [pendingFiltersTransition, startFiltersTransition] = useTransition();

	// clear all filters
	function clearAllFilters() {
		startFiltersTransition(() => {
			setOptimisticSelection(new Set());
			removeAllQueryParams();
		});
	}

	// toggle archived
	function toggleArchived() {
		startFiltersTransition(() => {
			if (data.showArchived) {
				setOptimisticFilters({ ...optimisticFilters, showArchived: false });
				removeByKey('showArchived');
				return;
			}

			setOptimisticFilters({ ...optimisticFilters, showArchived: true });
			return setQuery('showArchived', true);
		});
	}

	// search
	function setSearch(search: string) {
		startFiltersTransition(() => {
			if (search.length) {
				setOptimisticFilters({ ...optimisticFilters, search });
				return setQuery('search', search);
			} else {
				setOptimisticFilters({ ...optimisticFilters, search: '' });
				return removeByKey('search');
			}
		});
	}

	const lastSelectedWorkflowId =
		optimisticSelection === 'all' ? undefined : (
			Array.from(optimisticSelection).pop()?.toString()
		);

	const lastSelectedWorkflow = infiniteWorkflows.workflows.find(
		w => w.id === lastSelectedWorkflowId,
	);

	const contextValue = {
		workflows: infiniteWorkflows.workflows,
		workflowSelection: optimisticSelection,
		lastSelectedWorkflowId,
		lastSelectedWorkflow,
		setWorkflowSelection,
		gridListRef,
		focusGridList: () => gridListRef.current?.focus(),
		showCreateWorkflowModal,
		setShowCreateWorkflowModal,
		showUpdateWorkflowModal,
		setShowUpdateWorkflowModal,
		showArchiveWorkflowModal,
		setShowArchiveWorkflowModal,
		showDeleteWorkflowModal,
		setShowDeleteWorkflowModal,
		filters: optimisticFilters,
		pendingFiltersTransition,
		setSearch,
		toggleArchived,
		clearAllFilters,
	} satisfies WorkflowContext;

	return (
		<WorkflowContext.Provider value={contextValue}>{children}</WorkflowContext.Provider>
	);
}

export function useWorkflowContext() {
	const context = useContext(WorkflowContext);
	if (!context) {
		throw new Error('useWorkflowContext must be used within a WorkflowContextProvider');
	}
	return context;
}
