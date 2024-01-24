'use client';

import { trpc } from '../../utils/trpc';

const LinksPage = () => {
	const { data: links } = trpc.link.getAll.useQuery();

	return (
		<div>
			<h1>Links</h1>
			{links?.map(link => (
				<div key={link.id}>
					<a href={link.url}>{link.url}</a>
				</div>
			))}
		</div>
	);
};

export default LinksPage;
