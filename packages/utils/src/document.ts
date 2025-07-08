export function elementIsFocused(ref: React.RefObject<HTMLElement | null>) {
	return ref.current === document.activeElement;
}
