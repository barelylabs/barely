import { useCallback, useContext } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';

import type { SessionWorkspace } from '../server/auth';
import { WorkspaceContext } from '../context/workspace.context';
import { api } from '../server/api/react';
import { useSubscribe } from './use-subscribe';

export function useWorkspaceHandle() {
	const params = useParams();

	const handle = params?.handle;

	if (typeof handle === 'string') return handle;

	return null;
}

export function useSetWorkspace({ onBeginSet }: { onBeginSet?: () => void }) {
	const router = useRouter();
	const apiUtils = api.useUtils();
	const currentWorkspace = useWorkspace();
	const currentPath = usePathname();

	const setCurrentWorkspace = useCallback(
		async (workspace: SessionWorkspace) => {
			console.log('setting current workspace to', workspace, '@', Date.now());
			apiUtils.workspace.current.setData(undefined, workspace);

			// apiUtils.cancel()

			console.log('currentPath', currentPath);

			if (currentPath?.endsWith('carts')) {
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

			if (currentPath?.endsWith('email-broadcasts')) {
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

			if (currentPath?.endsWith('email-templates')) {
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

			if (currentPath?.endsWith('email-template-groups')) {
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

			if (currentPath?.endsWith('fan-groups')) {
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

			if (currentPath?.endsWith('fans')) {
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

			if (currentPath?.endsWith('flows')) {
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

			if (currentPath?.endsWith('fm')) {
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

			if (currentPath?.endsWith('links')) {
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

			if (currentPath?.endsWith('media')) {
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

			if (currentPath?.endsWith('mixtapes')) {
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

			if (currentPath?.endsWith('orders')) {
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

			if (currentPath?.endsWith('pages')) {
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

			if (currentPath?.endsWith('products')) {
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

			if (currentPath?.endsWith('tracks')) {
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

			onBeginSet?.();

			if (currentWorkspace.handle === workspace.handle) return;
			if (currentPath) {
				router.push(currentPath.replace(currentWorkspace.handle, workspace.handle));
				return console.log('pushed @', Date.now());
			}
			router.push(`/${workspace.handle}`);
			console.log('pushed @', Date.now());
		},
		[apiUtils, currentPath, currentWorkspace, router, onBeginSet],
	);

	return { setCurrentWorkspace };
}

export function useWorkspace() {
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
	const workspace = useWorkspace();

	return workspace.type === 'personal';
}
