import { z } from 'zod/v4';

export const inviteMemberSchema = z.object({
	email: z.email(),
	role: z.enum(['admin', 'member']),
});

export interface SessionWorkspaceInvite {
	userId: string | null;
	email: string;
	role: 'admin' | 'member';
	expiresAt: Date;
	workspace: {
		id: string;
		name: string;
		handle: string;
	};
}

export const acceptInviteSchema = z.object({
	workspaceId: z.string(),
});
