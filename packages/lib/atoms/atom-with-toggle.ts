import type { WritableAtom } from "jotai";
import { atom } from "jotai";

export function atomWithToggle(
  initialValue?: boolean,
): WritableAtom<boolean, [boolean?], void> {
  const anAtom = atom(initialValue, (get, set, nextValue?: boolean) => {
    const update = nextValue ?? !get(anAtom);
    set(anAtom, update);
  });

  return anAtom as WritableAtom<boolean, [boolean?], void>;
}

export type AtomWithToggle = ReturnType<typeof atomWithToggle>;
