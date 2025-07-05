/**
 * Utility function to focus a GridList component by its data attribute
 * @param resourceName - The name of the resource (e.g., 'landing-pages', 'tracks')
 */
export function focusGridList(resourceName: string) {
	const gridList = document.querySelector<HTMLElement>(
		`[data-grid-list="${resourceName}"]`,
	);
	gridList?.focus();
}

/**
 * Hook that returns a memoized focus function for a specific resource
 * Useful for focusing the grid list when modals close
 */
export function useFocusGridList(resourceName: string) {
	return () => focusGridList(resourceName);
}