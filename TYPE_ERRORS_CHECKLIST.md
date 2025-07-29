# Type and Lint Errors Checklist

## Priority 1: Missing imports and type declarations (easiest to fix)

### packages/validators/src/schemas/album.schema.ts
- [ ] Line 3: Module '"./track.schema"' has no exported member 'selectTrackSchemaForCardOnly'

### packages/validators/src/schemas/track.schema.ts
- [ ] Line 11: Module '"@barely/db/schema"' has no exported member 'albumArtists'
- [ ] Line 11: Module '"@barely/db/schema"' has no exported member 'albums'  
- [ ] Line 26: Module '"@barely/db/schema"' has no exported member 'albumsToArtists'

### packages/lib/src/integrations/spotify/spotify.endpts.search.ts
- [ ] Line 5: Type annotation: Change 'z' import to 'z/v4'

### packages/lib/src/integrations/spotify/spotify.endpts.album.ts
- [ ] Line 3: Module '"@barely/db/schema"' has no exported member 'albums'

### packages/lib/src/integrations/spotify/spotify.endpts.artist.ts  
- [ ] Line 4: Module '"@barely/db/schema"' has no exported member 'albums'
- [ ] Line 7: Module '"@barely/db/schema"' has no exported member 'albumArtists'

### packages/lib/src/integrations/spotify/spotify.endpts.track.ts
- [ ] Line 4: Module '"@barely/db/schema"' has no exported member 'trackArtists'

### packages/lib/src/functions/track.fns.ts
- [ ] Line 14: Module '"@barely/db/schema"' has no exported member 'albums'
- [ ] Line 14: Module '"@barely/db/schema"' has no exported member 'trackAlbums'
- [ ] Line 19: Module '"../integrations/spotify/spotify.endpts.album"' has no exported member 'upsertAlbum'

### packages/lib/src/trigger/streaming-stats.trigger.ts
- [ ] Line 3: Module '"@barely/db/client"' has no exported member 'eq'
- [ ] Line 3: Module '"@barely/db/client"' has no exported member 'sql'
- [ ] Line 4: Module '"@barely/db/schema"' has no exported member 'statsSpotifyMonthlyListeners'

### packages/tb/src/schema/streaming-ingest.schema.ts
- [ ] Line 1: Type annotation: Change 'z' import to 'z/v4'

### packages/tb/src/schema/streaming-query.schema.ts
- [ ] Line 1: Type annotation: Change 'z' import to 'z/v4'

### packages/db/src/sql/album.sql.ts
- [ ] Line 3: Module '"../schema"' has no exported member 'albums'
- [ ] Line 3: Module '"../schema"' has no exported member 'albumsToArtists'

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/page.tsx
- [ ] Line 3: Cannot find module '@barely/api/app' or its corresponding type declarations

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/linked-spotify-tracks.tsx
- [ ] Line 7: Module '"@barely/ui/card"' has no exported member 'CardContent'
- [ ] Line 7: Module '"@barely/ui/card"' has no exported member 'CardHeader'
- [ ] Line 7: Module '"@barely/ui/card"' has no exported member 'CardTitle'

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-stat-header.tsx
- [ ] Line 5: Module '"@barely/ui/card"' has no exported member 'CardContent'
- [ ] Line 5: Module '"@barely/ui/card"' has no exported member 'CardHeader'

## Priority 2: Type import consistency

### packages/ui/src/elements/multi-toggle.tsx
- [ ] Line 7: All imports in the declaration are only used as types. Use `import type`

### apps/app/src/app/[handle]/tracks/_components/track-context.tsx
- [ ] Line 11: All imports in the declaration are only used as types. Use `import type`

## Priority 3: Unsafe type operations

### packages/validators/src/schemas/album.schema.ts
- [ ] Line 65: Unsafe argument of type `any` assigned to a parameter of type `TRPCMiddlewareFunction`
- [ ] Line 65: Unsafe assignment of an `any` value

### packages/lib/src/integrations/spotify/spotify.endpts.search.ts
- [ ] Line 71: Unsafe assignment of an `any` value
- [ ] Line 72: Unsafe member access .attributes on an `any` value
- [ ] Line 78: Unsafe assignment of an `any` value
- [ ] Line 79: Unsafe member access .attributes on an `any` value
- [ ] Line 85: Unsafe assignment of an `any` value  
- [ ] Line 86: Unsafe member access .attributes on an `any` value

### packages/lib/src/functions/spotify.fns.ts
- [ ] Line 104: Unsafe assignment of an `any` value
- [ ] Line 105: Unsafe member access .id on an `any` value
- [ ] Line 107: Unsafe member access .attributes on an `any` value

### packages/tb/src/query/streaming.ts
- [ ] Line 22: Unsafe member access .data on an `any` value

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/linked-spotify-tracks.tsx
- [ ] Line 60: Unsafe member access .id on an `any` value
- [ ] Line 60: Unsafe argument of type `any` assigned to a parameter of type `never`

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-stat-header.tsx
- [ ] Line 60: Argument of type 'any' is not assignable to parameter of type 'never'

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-timeseries.tsx
- [ ] Line 98: Unexpected any. Specify a different type
- [ ] Line 98: Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<"1d" | "1w" | "28d" | "1y">`

## Priority 4: Unused variables/imports

### packages/lib/src/trigger/streaming-stats.trigger.ts
- [ ] Line 23: 'task' is defined but never used

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-timeseries.tsx
- [ ] Line 4: 'useParams' is defined but never used

### apps/app/src/app/[handle]/tracks/_components/all-tracks.tsx
- [ ] Line 31: 'hasNextPage' is assigned a value but never used
- [ ] Line 32: 'fetchNextPage' is assigned a value but never used
- [ ] Line 33: 'isFetchingNextPage' is assigned a value but never used

## Priority 5: Logic errors and unnecessary conditions

### packages/tb/src/query/streaming.ts
- [ ] Line 3: 'any' overrides all other types in this union type

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/linked-spotify-tracks.tsx
- [ ] Line 16: Object is possibly 'undefined' (cannot invoke)
- [ ] Line 47: Type '"default"' is not assignable to valid button variant types
- [ ] Line 58: Type '"ghost"' is not assignable to valid button types
- [ ] Line 64: Property 'external' does not exist on icon type

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-stat-header.tsx
- [ ] Line 14: Object is possibly 'undefined' (cannot invoke)

### apps/app/src/app/[handle]/tracks/[trackId]/spotify-stats/spotify-timeseries.tsx
- [ ] Line 60: Unnecessary conditional, expected left-hand side of `??` to be possibly null or undefined
- [ ] Line 65: Unnecessary optional chain on a non-nullish value
- [ ] Line 66: Unnecessary optional chain on a non-nullish value

### apps/app/src/app/[handle]/tracks/_components/all-tracks.tsx
- [ ] Line 40: Unnecessary optional chain on a non-nullish value
- [ ] Line 41: Prefer using nullish coalescing operator (`??=`) instead of assignment
- [ ] Line 55: Unnecessary optional chain on a non-nullish value
- [ ] Line 56: Unnecessary optional chain on a non-nullish value
- [ ] Line 176: Unnecessary optional chain on a non-nullish value
- [ ] Line 178: Unnecessary conditional, the types have no overlap
- [ ] Line 183: Unnecessary conditional, value is always truthy

### apps/app/src/app/[handle]/tracks/_components/track-filters.tsx
- [ ] Line 32: Unnecessary conditional, expected left-hand side of `??` to be possibly null or undefined
- [ ] Line 34: Unnecessary conditional, expected left-hand side of `??` to be possibly null or undefined

## Summary
- Total errors: 67
- Packages affected: 8
- Priority 1 (Missing imports): 24 errors
- Priority 2 (Type imports): 2 errors
- Priority 3 (Unsafe operations): 14 errors
- Priority 4 (Unused variables): 5 errors
- Priority 5 (Logic errors): 22 errors