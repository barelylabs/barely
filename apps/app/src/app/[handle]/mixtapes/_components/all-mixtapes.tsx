"use client";

import { NoResultsPlaceholder } from "@barely/ui/components/no-results-placeholder";
import { GridList, GridListCard } from "@barely/ui/elements/grid-list";

import type { EdgeRouterOutputs } from "@barely/lib/server/api/router.edge";

import { CreateMixtapeButton } from "~/app/[handle]/mixtapes/_components/create-mixtape-button";
import { useMixtapesContext } from "~/app/[handle]/mixtapes/_components/mixtape-context";

export function AllMixtapes() {
  const {
    mixtapes,
    mixtapeSelection,
    lastSelectedMixtapeId,
    setMixtapeSelection,
    gridListRef,
    setShowUpdateMixtapeModal,
    focusGridList,
  } = useMixtapesContext();

  return (
    <>
      <GridList
        glRef={gridListRef}
        className="flex flex-col gap-2"
        aria-label="Mixtapes"
        selectionMode="multiple"
        selectionBehavior="replace"
        onAction={() => {
          if (!lastSelectedMixtapeId) return;
          setShowUpdateMixtapeModal(true);
        }}
        items={mixtapes}
        selectedKeys={mixtapeSelection}
        setSelectedKeys={setMixtapeSelection}
        renderEmptyState={() => (
          <NoResultsPlaceholder
            icon="mixtape"
            title="No Mixtapes"
            subtitle="Create a new mixtape to get started."
            button={<CreateMixtapeButton />}
          />
        )}
      >
        {(mixtape) => <MixtapeCard mixtape={mixtape} />}
      </GridList>
      <button onClick={() => focusGridList()}>Focus GridList</button>
    </>
  );
}

function MixtapeCard({
  mixtape,
}: {
  mixtape: EdgeRouterOutputs["mixtape"]["byWorkspace"][0];
}) {
  const {
    setShowUpdateMixtapeModal,
    setShowArchiveMixtapeModal,
    setShowDeleteMixtapeModal,
  } = useMixtapesContext();

  return (
    <GridListCard
      id={mixtape.id}
      key={mixtape.id}
      textValue={mixtape.name}
      setShowUpdateModal={setShowUpdateMixtapeModal}
      setShowArchiveModal={setShowArchiveMixtapeModal}
      setShowDeleteModal={setShowDeleteMixtapeModal}
    >
      {mixtape.name}
    </GridListCard>
  );
}
