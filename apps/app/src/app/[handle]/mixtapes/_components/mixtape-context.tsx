'use client';

import type { EdgeRouterOutputs } from '@barely/lib/server/api/router.edge';
import type { MixtapeWith_Tracks } from '@barely/lib/server/mixtape.schema';
import type { Selection } from 'react-aria-components';
import type { z } from 'zod';
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
import { mixtapeFilterParamsSchema } from '@barely/lib/server/mixtape.schema';
import { wait } from '@barely/lib/utils/wait';

interface MixtapeContext {
	mixtapes: MixtapeWith_Tracks[];
	mixtapeSelection: Selection;
	lastSelectedMixtapeId: string | undefined;
	lastSelectedMixtape: MixtapeWith_Tracks | undefined;
	setMixtapeSelection: (selection: Selection) => void;
	gridListRef: React.RefObject<HTMLDivElement>;
	focusGridList: () => void;
	showCreateMixtapeModal: boolean;
	setShowCreateMixtapeModal: (show: boolean) => void;
	showUpdateMixtapeModal: boolean;
	setShowUpdateMixtapeModal: (show: boolean) => void;
	showArchiveMixtapeModal: boolean;
	setShowArchiveMixtapeModal: (show: boolean) => void;
	showDeleteMixtapeModal: boolean;
	setShowDeleteMixtapeModal: (show: boolean) => void;
}

const MixtapeContext = createContext<MixtapeContext | undefined>(undefined);

export function MixtapeContextProvider({
	children,
	initialMixtapes,
	filters = {},
}: {
	children: React.ReactNode;
	initialMixtapes: Promise<EdgeRouterOutputs['mixtape']['byWorkspace']>;
	filters: z.infer<typeof mixtapeFilterParamsSchema> | undefined;
}) {
	const [showCreateMixtapeModal, setShowCreateMixtapeModal] = useState(false);
	const [showEditMixtapeModal, setShowEditMixtapeModal] = useState(false);
	const [showArchiveMixtapeModal, setShowArchiveMixtapeModal] = useState(false);
	const [showDeleteMixtapeModal, setShowDeleteMixtapeModal] = useState(false);

	const { handle } = useWorkspace();
	const { data: mixtapes } = api.mixtape.byWorkspace.useQuery(
		{ handle },
		{
			initialData: use(initialMixtapes),
		},
	);

	const gridListRef = useRef<HTMLDivElement>(null);

	const [optimisticSelection, setOptimisticSelection] = useOptimistic<Selection>(
		new Set(filters.selectedMixtapeIds),
	);

	const { setQuery, removeByKey } = useTypedQuery(mixtapeFilterParamsSchema);
	const [, startSelectTransition] = useTransition();

	function setSelectedKeys(selection: Selection) {
		startSelectTransition(() => {
			setOptimisticSelection(selection);
			if (selection === 'all') {
				return;
			}
			if (selection.size === 0) {
				return removeByKey('selectedMixtapeIds');
			} else {
				setQuery(
					'selectedMixtapeIds',
					Array.from(selection).map(key => key.toString()),
				);
			}
		});
	}

	const lastSelectedMixtapeId =
		optimisticSelection === 'all'
			? undefined
			: Array.from(optimisticSelection).pop()?.toString();
	const lastSelectedMixtape = mixtapes.find(
		mixtape => mixtape.id === lastSelectedMixtapeId,
	);

	const contextValue = {
		mixtapes,
		mixtapeSelection: optimisticSelection,
		lastSelectedMixtapeId,
		lastSelectedMixtape,
		setMixtapeSelection: setSelectedKeys,
		gridListRef,
		focusGridList: () => {
			wait(1)
				.then(() => gridListRef.current?.focus())
				.catch(console.error);
		}, // fixme: this is a workaround for focus not working on modal closing
		showCreateMixtapeModal,
		setShowCreateMixtapeModal,
		showUpdateMixtapeModal: showEditMixtapeModal,
		setShowUpdateMixtapeModal: setShowEditMixtapeModal,
		showArchiveMixtapeModal,
		setShowArchiveMixtapeModal,
		showDeleteMixtapeModal,
		setShowDeleteMixtapeModal,
	} satisfies MixtapeContext;

	return (
		<MixtapeContext.Provider value={contextValue}>{children}</MixtapeContext.Provider>
	);
}

export function useMixtapesContext() {
	const context = useContext(MixtapeContext);
	if (!context) {
		throw new Error('useMixtapesContext must be used within a MixtapesContext');
	}
	return context;
}
