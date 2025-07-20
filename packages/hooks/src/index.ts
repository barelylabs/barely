// Utility hooks
export { useCopy } from './use-copy';
export { useDebounce } from './use-debounce';
export { useDebounceValue } from './use-debounce-value';
export { useDebouncedCallback } from './use-debounced-callback';
export { useEffectOnce } from './use-effect-once';
export { useEventCallback } from './use-event-callback';
export { useEventListener } from './use-event-listener';
export { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
export { useKeyPress } from './use-key-press';
export { useMediaQuery } from './use-media-query';
export * from './use-container';
export { useIntersectionObserver } from './use-intersection-observer';
export { useOnClickOutside } from './use-onClick-outside';
export { useLocale } from './use-locale';
export { useDropzone } from './use-dropzone';
export { useSessionStorage } from './use-session-storage';
export { useFormatTimestamp } from './use-format-timestamp';

// Navigation hooks
export { useCompatSearchParams } from './use-compat-search-params';
export { usePathnameMatchesCurrentGroup } from './use-pathname-matches-current-group';
export {
	usePathnameEndsWith,
	usePathnameMatchesCurrentPath,
} from './use-pathname-matches-current-path';
export { useRouterQuery } from './use-router-query';
export { useRouterTools } from './use-router-tools';
export { useSetSearchParams } from './use-set-search-params';
export { useTypedOptimisticQuery } from './use-typed-optimistic-query';
export { useTypedOptimisticParams } from './use-typed-optimistic-params';
export { useUrlMatchesCurrentUrl } from './use-url-matches-current-url';
export { useNavHistory, useUpdateNavHistory } from './use-nav-history';

// Auth & Workspace hooks
export { useUser, UserContext } from './use-user';
export * from './use-workspace';
export { useWorkspaces } from './use-workspaces';
export { useWorkspaceAssets } from './use-workspace-assets';
export { useWorkspaceHotkeys, gKeyPressedAtom } from './use-workspace-hotkeys';
export { useWorkspaceUpdateForm } from './use-workspace-update-form';
export { useUpdateWorkspace } from './use-update-workspace';
export { useUsage } from './use-usage';

// Real-time hooks
export { usePusher, usePusherSocketId } from './use-pusher';
export { useSubscribe } from './use-subscribe';

// File management hooks
export { useFiles } from './use-files';
export * from './use-upload';
export type { UseUploadProps, UploadQueueItem } from './use-upload';

// Form & UI hooks
export { useCreateOrUpdateForm } from './use-create-or-update-form';
export { useModalHotKeys } from './use-modal-hot-keys';
export { useZodForm } from './use-zod-form';

// Domain-specific hooks
export { useCartFunnels } from './use-cart-funnels';
export { useEmailDomains } from './use-email-domains';
export { useProducts } from './use-products';
export { useWebDomains } from './use-web-domains';

// Stat filter hooks
export * from './use-cart-stat-filters';
export * from './use-fm-stat-filters';
export * from './use-link-stat-filters';
export * from './use-page-stat-filters';
export * from './use-web-event-stat-filters';

// Resource hook factories
export { createResourceSearchParamsHook } from './use-resource-search-params';
export { createResourceDataHook } from './use-resource-data';
export { focusGridList, useFocusGridList } from './use-focus-gridlist';
export type {
	BaseResourceFilters,
	ResourceModalState,
	ResourceSearchParamsReturn,
	ResourceSearchParamsConfig,
	ResourceDataReturn,
	ResourceDataConfig,
} from './resource-hooks.types';
export { action } from './resource-hooks.types';

// Utility hooks

// Re-export types
// export type { RouterOutputs } from './use-typed-optimistic-query';
