import { atomWithStorage, createJSONStorage } from "jotai/utils";

const pageStorage = createJSONStorage(() => sessionStorage);

const pageSession = {
  id: typeof window !== "undefined" ? window.crypto.randomUUID() : "server",
  storage: pageStorage,
};

const pageSessionAtom = atomWithStorage("session", pageSession);
type PageSession = typeof pageSession;

const localVisitorSession = {
  id: typeof window !== "undefined" ? window.crypto.randomUUID() : "server",
};

const localVisitorSessionAtom = atomWithStorage(
  "visitorSession",
  localVisitorSession,
);
type LocalVisitorSession = typeof localVisitorSession;

export {
  pageSessionAtom,
  type PageSession,
  localVisitorSessionAtom,
  type LocalVisitorSession,
};
