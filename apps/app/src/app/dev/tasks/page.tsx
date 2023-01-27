'use client';

import { Button } from '@barely/ui/src/Button';
import { useState } from 'react';
import { trpc } from '~/utils/trpc';

function StoriesPage() {
	const boardsQuery = trpc.storyBoard.byUser.useQuery();
	const [boardId, setBoardId] = useState<string | null>(null);

	const [limitPerColumn, setLimitPerColumn] = useState(30);

	// const columnsQuery = trpc.storyColumn.byBoard.useQuery({ id: boardId ?? '' } ?? '', {
	// 	enabled: !!boardId,
	// });
	// const columns = columnsQuery.data ?? [];

	// const storiesQueries = trpc.useQueries(t =>
	// 	columns.map(column => t.story.byColumn({ columnId: column.id })),
	// );

	// const utils = trpc.useContext();

	// const newStoryMutation = trpc.story.add.useMutation({
	// 	async onMutate(story) {
	// 		await utils.story.invalidate();
	// 	},
	// });

	return (
		// add a title that say stories, a select to choose a board, a number input to choose the limit per column, a button to add a new story
		<>
			{/* {boardsQuery.data?.map(board => (
				<option key={board.id} value={board.id}>
					{board.name}
				</option>
			))} */}

			{/* */}

			{/* {columns.map(column => (
        <div key={column.id}>
          <h2>{column.name}</h2>
          {storiesQueries.map(query => (
            <div key={query.data?.id}>
              {query.data?.title}
            </div>
          ))}
        </div>
      ))} */}
		</>
	);
}

export default StoriesPage;
