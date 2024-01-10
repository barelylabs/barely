import { z } from "zod";

import { wait } from "../utils/wait";
import { zDelete, zGet, zPost } from "../utils/zod-fetch";

//* ✨ ENDPOINTS ✨ *//

const getSpotifyPlaylist = async (props: {
  accessToken: string;
  spotifyId: string;
}) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${props.spotifyId}`;
  const auth = `Bearer ${props.accessToken}`;
  const response = await zGet(endpoint, getPlaylistResponseSchema, { auth });
  return response;
};

const getSpotifyUserPlaylists = async (props: {
  accessToken: string;
  userSpotifyId: string;
  limit?: number;
}) => {
  const limit = props.limit ?? 20;

  const endpoint = `https://api.spotify.com/v1/users/${props.userSpotifyId}/playlists?limit=${limit}`;
  const auth = `Bearer ${props.accessToken}`;

  const playlists = [];
  let offset = 0;
  let total = 0;
  do {
    const res = await zGet(
      `${endpoint}&offset=${offset}`,
      getUserPlaylistsResponseSchema,
      { auth },
    );

    if (res.success && res.parsed) {
      playlists.push(...res.data.items);
      total = res.data.total;
    }

    offset += limit;

    await wait();
  } while (playlists.length < total);
  return playlists.filter(
    (playlist) => playlist.owner.id === props.userSpotifyId,
  );
};

const getSpotifyPlaylistTracks = async (props: {
  accessToken: string;
  spotifyId: string;
  limit?: number;
}) => {
  const totalLimit = props?.limit ?? 250;
  const requestLimit = props.limit && props.limit < 50 ? props.limit : 50;
  const fields =
    "total,items(added_at,track(id,name,artists(id,name),album(id,name,images),external_ids,popularity))";
  const endpoint = `https://api.spotify.com/v1/playlists/${props.spotifyId}/tracks?limit=${requestLimit}&fields=${fields}`;
  const auth = `Bearer ${props.accessToken}`;

  const tracks = [];
  let offset = 0;
  let total = 0;
  do {
    const res = await zGet(
      `${endpoint}&offset=${offset}`,
      getPlaylistTracksResponseSchema,
      { auth },
    );

    if (res.success && res.parsed) {
      tracks.push(...res.data.items);
      total = res.data.total;
    }

    offset += requestLimit;
    await wait();
  } while (tracks.length < total && tracks.length < totalLimit);
  return tracks;
};

const getSpotifyPlaylistTrackIds = async (props: {
  accessToken: string;
  spotifyId: string;
  limit?: number;
}) => {
  const totalLimit = props?.limit ?? 250;
  const requestLimit = props.limit && props.limit < 50 ? props.limit : 50;
  const fields = "total,items(track(id))";
  const endpoint = `https://api.spotify.com/v1/playlists/${props.spotifyId}/tracks?limit=${requestLimit}&fields=${fields}`;
  const auth = `Bearer ${props.accessToken}`;

  const tracks = [];
  let offset = 0;
  let total = 0;
  do {
    const response = await zGet(
      `${endpoint}&offset=${offset}`,
      getPlaylistTrackIdsResponseSchema,
      { auth },
    );

    if (response.success && response.parsed) {
      tracks.push(...response.data.items);
      total = response.data.total;
    }

    offset += requestLimit;
    await wait();
  } while (tracks.length < total && tracks.length < totalLimit);
  return tracks.map((track) => track.track.id);
};

const addTrackToSpotifyPlaylist = async (props: {
  accessToken: string;
  trackSpotifyId: string;
  playlistSpotifyId: string;
  position: number;
}) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${props.playlistSpotifyId}/tracks?position=${props.position}`;
  const auth = `Bearer ${props.accessToken}`;
  const response = await zPost(endpoint, addTrackToPlaylistResponseSchema, {
    auth,
    body: {
      uris: [`spotify:track:${props.trackSpotifyId}`],
      position: props.position,
    },
  });
  return response;
};

const removeTrackFromSpotifyPlaylist = async (props: {
  accessToken: string;
  trackSpotifyId: string;
  playlistSpotifyId: string;
}) => {
  const endpoint = `https://api.spotify.com/v1/playlists/${props.playlistSpotifyId}/tracks`;
  const auth = `Bearer ${props.accessToken}`;
  const response = await zDelete(
    endpoint,
    removeTrackFromPlaylistResponseSchema,
    {
      auth,
      body: {
        tracks: [{ uri: `spotify:track:${props.trackSpotifyId}` }],
      },
    },
  );

  return response;
};

export {
  getSpotifyUserPlaylists,
  getSpotifyPlaylist,
  getSpotifyPlaylistTracks,
  getSpotifyPlaylistTrackIds,
  addTrackToSpotifyPlaylist,
  removeTrackFromSpotifyPlaylist,
};

//* 📓 SCHEMA 📓 *//

const getPlaylistResponseSchema = z.object({
  // every time
  id: z.string(),
  name: z.string(),
  description: z.string(),
  followers: z.object({
    href: z.string(),
    total: z.number(),
  }),
  images: z.array(
    z.object({
      url: z.string(),
      height: z.number().nullable(),
      width: z.number().nullable(),
    }),
  ),
  owner: z.object({
    display_name: z.string(),
    external_urls: z.object({
      spotify: z.string(),
    }),
    href: z.string(),
    id: z.string(),
    type: z.enum(["user"]),
    uri: z.string(),
  }),
  public: z.boolean(),
  tracks: z.object({
    href: z.string(),
    total: z.number(),
  }),

  // sometimes
  collaborative: z.boolean().nullish(),
  external_urls: z
    .object({
      spotify: z.string(),
    })
    .nullish(),
  href: z.string().nullish(),
  snapshot_id: z.string().nullish(),
  type: z.enum(["playlist"]).nullish(),
  uri: z.string().nullish(),
});

const getPlaylistTrackIdsResponseSchema = z.object({
  // every time
  total: z.number(),
  items: z.array(
    z.object({
      // every time
      track: z.object({
        // every time
        id: z.string(),
      }),
    }),
  ),
});

const getPlaylistTracksResponseSchema = z.object({
  // every time
  total: z.number(),
  items: z.array(
    z.object({
      // every time
      added_at: z.string(),
      track: z.object({
        // every time
        id: z.string(),
        name: z.string(),
        external_ids: z.object({
          isrc: z.string(),
        }),
        album: z.object({
          // every time
          id: z.string(),
          name: z.string(),
          images: z
            .array(
              z.object({
                url: z.string(),
                height: z.number().nullable(),
                width: z.number().nullable(),
              }),
            )
            .nullish(),

          // sometimes
          album_type: z.string().nullish(),
          artists: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                external_urls: z
                  .object({
                    spotify: z.string(),
                  })
                  .nullish(),
                href: z.string().nullish(),
                type: z.enum(["artist"]).nullish(),
                uri: z.string().nullish(),
              }),
            )
            .nullish(),
          available_markets: z.array(z.string()).nullish(),
          external_urls: z
            .object({
              spotify: z.string(),
            })
            .nullish(),
          href: z.string().nullish(),
          release_date: z.string().nullish(),
          release_date_precision: z.string().nullish(),
          total_tracks: z.number().nullish(),
          type: z.enum(["album"]).nullish(),
          uri: z.string().nullish(),
        }),
        artists: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            external_urls: z
              .object({
                spotify: z.string(),
              })
              .nullish(),
            href: z.string().nullish(),
            type: z.enum(["artist"]).nullish(),
            uri: z.string().nullish(),
          }),
        ),
        popularity: z.number(),
        // sometimes
        available_markets: z.array(z.string()).nullish(),
        disc_number: z.number().nullish(),
        duration_ms: z.number().nullish(),
        explicit: z.boolean().nullish(),
        external_urls: z
          .object({
            spotify: z.string(),
          })
          .nullish(),
        href: z.string().nullish(),
        is_local: z.boolean().nullish(),
        is_playable: z.boolean().nullish(),
        preview_url: z.string().nullish(),
        track_number: z.number().nullish(),
        type: z.enum(["track"]).nullish(),
        uri: z.string().nullish(),
      }),

      // sometimes
      added_by: z
        .object({
          id: z.string(),
          external_urls: z
            .object({
              spotify: z.string(),
            })
            .nullish(),
          href: z.string().nullish(),
          type: z.enum(["user"]).nullish(),
          uri: z.string().nullish(),
        })
        .nullish(),
      is_local: z.boolean().nullish(),
    }),
  ),

  // sometimes
  href: z.string().nullish(),
  limit: z.number().nullish(),
  next: z.string().nullish(),
  offset: z.number().nullish(),
  previous: z.string().nullish(),
});

const getUserPlaylistsResponseSchema = z.object({
  // every time
  total: z.number(),
  items: z.array(
    z.object({
      // every time
      id: z.string(),
      name: z.string(),
      description: z.string(),
      public: z.boolean(),
      images: z.array(
        z.object({
          url: z.string(),
          height: z.number().nullable(),
          width: z.number().nullable(),
        }),
      ),
      owner: z.object({
        id: z.string(),
        display_name: z.string().nullable(),
        external_urls: z
          .object({
            spotify: z.string(),
          })
          .nullish(),
        href: z.string().nullish(),
        type: z.enum(["user"]),
        uri: z.string().nullish(),
      }),
      tracks: getPlaylistTracksResponseSchema.partial({
        limit: true,
        next: true,
        offset: true,
        previous: true,
        items: true,
      }),

      // sometimes
      collaborative: z.boolean().nullish(),
      external_urls: z
        .object({
          spotify: z.string(),
        })
        .nullish(),
      href: z.string().nullish(),
      snapshot_id: z.string(),
      type: z.enum(["playlist"]).nullish(),
      uri: z.string().nullish(),
    }),
  ),
  // sometimes
  href: z.string().nullish(),
  limit: z.number().nullish(),
  next: z.string().nullish(),
  offset: z.number().nullish(),
  previous: z.string().nullish(),
});

const addTrackToPlaylistResponseSchema = z.object({
  snapshot_id: z.string(),
});

const removeTrackFromPlaylistResponseSchema = z.object({
  snapshot_id: z.string(),
});

export {
  getPlaylistResponseSchema,
  getPlaylistTracksResponseSchema,
  getUserPlaylistsResponseSchema,
};
