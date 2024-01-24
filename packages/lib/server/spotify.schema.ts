import type { TrackWithWorkspaceAndGenres } from "./track.schema";

interface SpotifyTrackOptionArtist
  extends Pick<TrackWithWorkspaceAndGenres["workspace"], "name"> {
  id?: string;
  handle?: string;
  spotifyArtistId: string;
}

export type SpotifyTrackOption = Pick<
  TrackWithWorkspaceAndGenres,
  "id" | "name" | "isrc" | "spotifyId" | "released" | "imageUrl"
> & {
  workspace: SpotifyTrackOptionArtist;
};
