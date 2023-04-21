'use client';

// import { Button } from '@barely/ui/src/Button';
import { node } from '~/client/trpc';

function DevPage() {
	// const utils = trpc.useContext();
	const userQuery = node.user.current.useQuery();
	const boardsQuery = node.storyBoard.byUser.useQuery();

	// const newBoard = trpc.storyBoard.add.useMutation({
	// 	async onSuccess(board) {
	// 		await utils.storyBoard.byUser.invalidate();
	// 	},
	// });

	return (
		<div>
			{userQuery.data?.id}
			<h1>Dev Page</h1>
			{/* {boardsQuery.data?.map(board => (
				<div key={board.id}>{board.name}</div>
			))} */}
			{/* <Button onClick={() => newBoard.mutate({ name: 'new board 3' })}>Add Board</Button> */}
		</div>
	);
}

export default DevPage;
