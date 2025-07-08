import type { Selection } from 'react-aria-components';
import { useState } from 'react';

export function useSelection({
	initialSelectedKeys = new Set(),
}: {
	initialSelectedKeys?: Selection;
} = {}) {
	const [selectedKeys, setSelectedKeys] = useState<Selection>(initialSelectedKeys);

	return [selectedKeys, setSelectedKeys] as const;
}
