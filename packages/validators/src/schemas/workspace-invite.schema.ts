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

export const acceptInviteSchema = z
	.object({
		workspaceId: z.string().optional(),
		inviteToken: z.string().optional(),
	})
	.refine(data => data.workspaceId ?? data.inviteToken, {
		message: 'Either workspaceId or inviteToken must be provided',
	});
