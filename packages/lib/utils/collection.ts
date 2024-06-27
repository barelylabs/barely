import { LexoRank } from 'lexorank';

interface Item {
	id: string;
	lexorank?: string;
}

export function lexoAfterLast(lastLexoRank: string) {
	const lastLexo = LexoRank.parse(lastLexoRank);
	return lastLexo.between(LexoRank.max()).toString();
}

export function lexoBeforeFirst(firstLexoRank: string) {
	const firstLexo = LexoRank.parse(firstLexoRank);
	return firstLexo.between(LexoRank.min()).toString();
}

export function lexoBetween(beforeLexoRank?: string, afterLexoRank?: string) {
	const beforeLexo = beforeLexoRank ? LexoRank.parse(beforeLexoRank) : LexoRank.min();
	const afterLexo = afterLexoRank ? LexoRank.parse(afterLexoRank) : LexoRank.max();
	const between = beforeLexo.between(afterLexo).toString();
	return between;
}

export function lexoMiddle() {
	return LexoRank.middle().toString();
}

export function insert<T extends Item>({
	collection: rawCollection,
	insertId,
	itemsToInsert,
	position,
	reorder = true,
}: {
	collection: T[];
	insertId: string | null;
	itemsToInsert: T[];
	position: 'before' | 'after';
	reorder?: boolean;
}) {
	let collection = rawCollection;
	console.log(
		'rawCollection lexoranks',
		collection.map(v => v.lexorank),
	);

	try {
		rawCollection.forEach(v => LexoRank.parse(v.lexorank ?? ''));
	} catch (error) {
		const lexoSafeCollection = [...rawCollection];
		for (let i = 0; i < collection.length; i++) {
			collection[i] = {
				...collection[i],
				lexorank:
					i === 0 ?
						LexoRank.min().toString()
					:	lexoAfterLast(collection[i - 1]?.lexorank ?? ''),
			} as T;
		}

		collection = lexoSafeCollection;
	}

	console.log(
		'updatedCollection lexoranks',
		collection.map(v => v.lexorank),
	);

	// "reordering"
	if (reorder && position === 'before' && insertId === itemsToInsert[0]?.id) {
		console.log('reordering before first item to be reordered... skipping');
		return {
			itemsToInsert,
			updatedCollection: collection,
			collectionChanged: false,
		};
	}

	if (
		reorder &&
		position === 'after' &&
		insertId === itemsToInsert[itemsToInsert.length - 1]?.id
	) {
		console.log('reordering after last item to be reordered... skipping');
		return {
			itemsToInsert,
			updatedCollection: collection,
			collectionChanged: false,
		};
	}

	console.log('reorder', reorder);
	console.log('itemsToInsert', itemsToInsert);
	console.log('collection', collection);

	const filteredCollection =
		reorder ?
			collection.filter(item => !itemsToInsert.some(i => i.id === item.id))
		:	collection;

	console.log('filteredCollection', filteredCollection);
	console.log('insertId', insertId);

	const insertIndex =
		filteredCollection.length ?
			filteredCollection.findIndex(item => item.id === insertId)
		:	0;

	console.log('insertIndex', insertIndex);

	if (insertIndex === -1) {
		throw new Error('Item not found');
	}

	const lexobefore =
		position === 'before' ?
			filteredCollection[insertIndex - 1]?.lexorank
		:	filteredCollection[insertIndex]?.lexorank;

	console.log('lexobefore', lexobefore);

	const lexoafter =
		position === 'before' ?
			filteredCollection[insertIndex]?.lexorank
		:	filteredCollection[insertIndex + 1]?.lexorank;

	console.log('lexoafter', lexoafter);

	// calculate lexorank for each item to insert
	for (let i = 0; i < itemsToInsert.length; i++) {
		if (!itemsToInsert[i]) continue;

		const lexorank =
			i === 0 ?
				lexoBetween(lexobefore, lexoafter)
			:	lexoBetween(itemsToInsert[i - 1]?.lexorank, lexoafter);

		console.log('updated lexorank', lexorank);
		itemsToInsert[i]!.lexorank = lexorank;
	}

	console.log(
		'itemsToInsert lexoranks',
		itemsToInsert.map(i => i.lexorank),
	);

	return {
		itemsToInsert,
		updatedCollection: [
			...filteredCollection.slice(
				0,
				position === 'before' ? insertIndex : insertIndex + 1,
			),
			...itemsToInsert,
			...filteredCollection.slice(position === 'before' ? insertIndex : insertIndex + 1),
		],
		collectionChanged: true,
	};
}
