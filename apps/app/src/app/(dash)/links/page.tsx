'use client';

import { node } from '~/client/trpc';

const LinksPage = () => {
	const { data: links } = node.link.getAll.useQuery();

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
