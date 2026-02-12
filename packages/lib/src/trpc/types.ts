import type { Session, SessionWorkspace } from '@barely/auth';
import type { NeonPool } from '@barely/db/pool';
import type { SessionWorkspaceInvite } from '@barely/validators';

/**
 * Enriched user type that includes workspace data.
 * This replaces the custom session user that was previously provided by Better Auth's customSession plugin.
 */
export interface EnrichedUser {
	// Standard Better Auth user fields
	id: string;
	email: string;
	name: string | null;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	image: string | null;
	// Additional profile fields (fetched separately)
	fullName: string | null;
	firstName: string | null;
	lastName: string | null;
	handle: string;
	avatarImageS3Key: string | undefined;
	pitchScreening: boolean;
	pitchReviewing: boolean;
	phone: string | null;
	// Workspaces are now fetched separately and added here
	workspaces: SessionWorkspace[];
	// Workspace invites
	workspaceInvites: SessionWorkspaceInvite[];
}

/**
 * Context type for privateProcedure after workspace enrichment.
 */
export interface PrivateProcedureContext {
	session: Session;
	user: EnrichedUser;
	workspaces: SessionWorkspace[];
	pool: NeonPool;
	pageSessionId: string | null;
	pusherSocketId: string | null;
}

/**
 * Context type for workspaceProcedure with the current workspace resolved.
 */
export interface WorkspaceProcedureContext extends PrivateProcedureContext {
	workspace: SessionWorkspace;
}
