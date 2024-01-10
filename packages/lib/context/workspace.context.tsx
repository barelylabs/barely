import { createContext } from "react";

import type { SessionWorkspace } from "../server/auth";

export const WorkspaceContext = createContext<SessionWorkspace | null>(null);
