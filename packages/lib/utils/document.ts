export function elementIsFocused(ref: React.RefObject<HTMLElement>) {
  return ref.current === document.activeElement;
}
