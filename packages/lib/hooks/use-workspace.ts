import { useCallback, useContext, useOptimistic, useTransition } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import type { SessionWorkspace } from '../server/auth';
import { WorkspaceContext } from '../context/workspace.context';
import { api } from '../server/api/react';
import { raise } from '../utils/raise';
import { useSubscribe } from './use-subscribe';

export function useWorkspaceHandle() {
	const params = useParams();

	const handle = params?.handle;

	if (typeof handle === 'string') return handle;

	return null;
}

export function useWorkspace({ onBeginSet }: { onBeginSet?: () => void } = {}) {
	const router = useRouter();
	const apiUtils = api.useUtils();
	// const currentWorkspace = useWorkspace();
	const pathname = usePathname();

	const initialWorkspace =
		useContext(WorkspaceContext) ??
		raise('useOptimisticWorkspace must be used within a WorkspaceProvider');

	const { data: currentWorkspace } = api.workspace.current.useQuery(undefined, {
		initialData: initialWorkspace,
	});

	const [pendingTransition, startTransition] = useTransition();

	const [optimisticWorkspace, setOptimisticWorkspace] = useOptimistic<SessionWorkspace>(
		currentWorkspace ?? initialWorkspace,
	);

	const setWorkspace = useCallback(
		function (workspace: SessionWorkspace) {
			console.log('setWorkspace', workspace, 'from', optimisticWorkspace);
			onBeginSet?.();

			startTransition(async () => {
				setOptimisticWorkspace(prev => {
					if (prev?.handle === workspace.handle) return prev;
					return workspace;
				});

				if (pathname?.endsWith('settings/team')) {
					// 2 queries depend on the current handle:
					// all workspace invites (depends on the current handle)
					// all workspace members (depends on the current handle)

					apiUtils.workspace.members.setData(
						{ handle: workspace.handle },
						apiUtils.workspace.members.getData({
							handle: workspace.handle,
						}) ?? [],
					);

					apiUtils.workspace.invites.setData(
						{ handle: workspace.handle },
						apiUtils.workspace.invites.getData({
							handle: workspace.handle,
						}) ?? [],
					);

					await apiUtils.workspace.members.invalidate();
					await apiUtils.workspace.invites.invalidate();
				}

				if (pathname?.endsWith('carts')) {
					apiUtils.cartFunnel.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.cartFunnel.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									cartFunnels: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.cartFunnel.invalidate();
				}

				if (pathname?.endsWith('email-broadcasts')) {
					apiUtils.emailBroadcast.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.emailBroadcast.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									emailBroadcasts: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);
				}

				if (pathname?.endsWith('email-templates')) {
					apiUtils.emailTemplate.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.emailTemplate.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									emailTemplates: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.emailTemplate.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('email-template-groups')) {
					apiUtils.emailTemplateGroup.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.emailTemplateGroup.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									emailTemplateGroups: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.emailTemplateGroup.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('fan-groups')) {
					apiUtils.fanGroup.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.fanGroup.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									fanGroups: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.fanGroup.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('fans')) {
					apiUtils.fan.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.fan.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									fans: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.fan.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('flows')) {
					apiUtils.flow.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.flow.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									flows: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.flow.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('fm')) {
					apiUtils.fm.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.fm.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									fmPages: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.fm.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('links')) {
					apiUtils.link.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.link.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									links: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.link.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('media')) {
					apiUtils.file.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.file.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									files: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.file.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('mixtapes')) {
					apiUtils.mixtape.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.mixtape.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									mixtapes: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.mixtape.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('orders')) {
					apiUtils.cartOrder.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.cartOrder.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									cartOrders: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.cartOrder.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('pages')) {
					apiUtils.landingPage.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.landingPage.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									landingPages: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.landingPage.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('products')) {
					apiUtils.product.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.product.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									products: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.product.byWorkspace.invalidate();
				}

				if (pathname?.endsWith('tracks')) {
					apiUtils.track.byWorkspace.setInfiniteData(
						{ handle: workspace.handle },
						apiUtils.track.byWorkspace.getInfiniteData({
							handle: workspace.handle,
						}) ?? {
							pages: [
								{
									tracks: [],
									nextCursor: undefined,
								},
							],
							pageParams: [],
						},
					);

					await apiUtils.track.byWorkspace.invalidate();
				}

				pathname && optimisticWorkspace ?
					router.push(pathname.replace(optimisticWorkspace.handle, workspace.handle))
				:	router.push(`/${workspace.handle}`);
			});
		},
		[apiUtils, pathname, optimisticWorkspace, router, onBeginSet],
	);

	return {
		workspace: optimisticWorkspace,
		handle: optimisticWorkspace.handle,
		setWorkspace,
		pendingTransition,
		isPersonal: optimisticWorkspace.type === 'personal',
	};
}

export function useWorkspace_old() {
	const currentWorkspace = useContext(WorkspaceContext);

	const apiUtils = api.useUtils();

	if (!currentWorkspace) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider');
	}

	/* we'll hydrate the workspace from the server to start, but then we want 
	to keep up to date w/ React Query after that */
	const { data: workspace } = api.workspace.current.useQuery(undefined, {
		initialData: currentWorkspace,
	});

	if (!workspace) {
		throw new Error('useWorkspace must be used within a WorkspaceProvider');
	}

	/* subscribe to updates to the workspace */
	useSubscribe({
		subscribeTo: {
			channel: 'workspace',
			ids: [workspace.id],
		},
		callback: async () => {
			await apiUtils.workspace.invalidate();
		},
	});

	return workspace;
}

export function useWorkspaceIsPersonal() {
	const { workspace } = useWorkspace();

	return workspace.type === 'personal';
}
