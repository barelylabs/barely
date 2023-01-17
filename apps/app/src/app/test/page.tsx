'use client';

import { trpc } from '../../client/trpcClient';

const TestPage = () => {
	const { data: user } = trpc.auth.getUser.useQuery();
	const { data: artists } = trpc.artist.findByCurrentUser.useQuery();
	// const linkQuery = trpc.link.getAll.useQuery();

	return (
		<>
			<div> hello {user?.id}</div>
			{artists?.length &&
				artists.map(artist => {
					return <div key={artist.id}>{artist.name}</div>;
				})}
		</>
	);
};

export default TestPage;
