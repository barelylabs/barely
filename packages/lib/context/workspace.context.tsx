import { createContext } from 'react';

import { SessionWorkspace } from '../server/auth';

export const WorkspaceContext = createContext<SessionWorkspace | null>(null);
