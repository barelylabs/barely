"use client";

import type { Control } from "react-hook-form";
import { api } from "@barely/server/api/react";
import { MultiSelect } from "@barely/ui/elements/multiselect";
import { MultiSelectField } from "@barely/ui/forms/multiselect-field";
import deepEqual from "fast-deep-equal";

import type {
  UpdatePlaylistPitchCampaign_LaunchSchema,
  UpdatePlaylistPitchCampaign_ScreeningSchema,
} from "@barely/server/campaign.schema";
import type { GenreWithPlaylistStats } from "@barely/server/genre.schema";

export function TrackGenresInput(props: { trackId: string }) {
  const utils = api.useContext();

  const [trackGenres] = api.track.byId.useSuspenseQuery(props.trackId, {
    select: (track) => track?.genres,
  });

  const { data: playlistGenreOptions, isFetching: isFetchingOptions } =
    api.genre.allInPitchPlaylists.useQuery();

  const { mutate: updateTrackGenres } = api.track.updateGenres.useMutation({
    async onMutate(track) {
      await utils.track.byId.cancel(props.trackId);
      const previousTrack = utils.track.byId.getData(props.trackId);

      if (!previousTrack) return;

      utils.track.byId.setData(props.trackId, (old) => {
        if (!old || deepEqual(old.genres, track.genres)) return old;
        return {
          ...previousTrack,
          genres: track.genres ?? [],
        };
      });

      return { previousTrack };
    },

    onError: (err, variables, context) => {
      if (context?.previousTrack) {
        utils.track.byId.setData(props.trackId, context.previousTrack);
      }
    },
  });

  const values: GenreWithPlaylistStats[] = trackGenres
    ? trackGenres.map((tg) => ({
        ...tg,
        totalPlaylists: 0,
        totalPitchReviewers: 0,
      }))
    : [];
  const options = playlistGenreOptions ?? [];

  return (
    <>
      <MultiSelect
        values={values}
        placeholder="Search for genres..."
        options={options}
        getItemId={(item) => item.name}
        isFetchingOptions={isFetchingOptions}
        displayValue={(option) => option.name}
        optTitle={(option) => option.name}
        optSubtitle={(option) => `${option.totalPlaylists} playlists`}
        onValuesChange={(genres) => {
          if (trackGenres === undefined) return;
          updateTrackGenres({
            trackId: props.trackId,
            genres: genres,
          });
        }}
      />
    </>
  );
}

type TrackGenresFieldProps = {
  trackId: string;
} & (
  | {
      formType: "playlist-pitch-screening";
      control: Control<UpdatePlaylistPitchCampaign_ScreeningSchema, unknown>;
    }
  | {
      formType: "playlist-pitch-launch";
      control: Control<UpdatePlaylistPitchCampaign_LaunchSchema, unknown>;
    }
);

export function TrackGenresField(props: TrackGenresFieldProps) {
  const utils = api.useContext();

  const { data: playlistGenreOptions, isFetching: isFetchingOptions } =
    api.genre.allInPitchPlaylists.useQuery();

  const { mutate: updateTrackGenres } = api.track.updateGenres.useMutation({
    onMutate: async (updatedTrack) => {
      await utils.campaign.toScreen.cancel();

      const previousCampaigns = utils.campaign.toScreen.getData();
      if (!previousCampaigns) return { previousCampaigns };

      utils.campaign.toScreen.setData(undefined, (old) => {
        if (!old ?? !old?.[0]) return old;

        const updatedCampaign = {
          ...old[0],
          track: {
            ...old[0].track,
            genres: updatedTrack.genres ?? [],
          },
        };

        const updatedCampaigns = [updatedCampaign];
        if (old?.[1]) updatedCampaigns.push(old?.[1]);

        return updatedCampaigns;
      });

      return { previousCampaigns };
    },

    onError: (err, variables, context) => {
      if (context?.previousCampaigns) {
        utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
      }
    },

    // onSettled: (err, variables, context) => {
    // 	console.log('status => ', status);
    // 	// utils.campaign.toScreen.invalidate();
    // },
  });

  const label = (
    <div className="flex flex-row items-center gap-1">
      <span>Genres</span>
    </div>
  );

  // fixme: I don't know how to make Typescript happy here. I'd rather do this a different way, but this should work for now.

  if (props.formType === "playlist-pitch-screening")
    return (
      <MultiSelectField
        name="genres"
        label={label}
        placeholder="Search for genres..."
        control={props.control}
        options={playlistGenreOptions ?? []}
        isFetchingOptions={isFetchingOptions}
        getItemId={(item) => item.id}
        displayValue={(item) => item.name}
        optTitle={(option) => option.name}
        optSubtitle={(option) => `${option.totalPlaylists ?? "?"} playlists`}
        onValuesChangeDebounced={(genres) => {
          updateTrackGenres({
            trackId: props.trackId,
            genres,
          });
        }}
        debounce={500}
        displayMode={"select"}
      />
    );

  if (props.formType === "playlist-pitch-launch")
    return (
      <MultiSelectField
        name="genres"
        label={label}
        description="These are the genres that your track will be pitched to."
        placeholder="Search for genres..."
        control={props.control}
        options={playlistGenreOptions ?? []}
        isFetchingOptions={isFetchingOptions}
        getItemId={(item) => item.name}
        displayValue={(item) => item.name}
        optTitle={(option) => option.name}
        optSubtitle={(option) => `${option.totalPlaylists ?? "?"} playlists`}
        onValuesChangeDebounced={(genres) => {
          updateTrackGenres({
            trackId: props.trackId,
            genres,
          });
        }}
        debounce={500}
        displayMode={"display"}
      />
    );
}

// export function TrackGenresField_PlaylistPitchScreening(props: {
// 	trackId: string;
// 	control: Control<UpdatePlaylistPitchCampaign_ScreeningSchema, unknown>;
// }) {
// 	const utils = api.useContext();

// 	const { data: playlistGenreOptions, isFetching: isFetchingOptions } =
// 		api.genre.allInPitchPlaylists.useQuery();

// 	const { mutate: updateTrackGenres, status } = api.track.updateGenres.useMutation({
// 		async onMutate() {
// 			await utils.campaign.toScreen.cancel();

// 			const previousCampaigns = utils.campaign.toScreen.getData();
// 			if (!previousCampaigns) return { previousCampaigns };

// 			utils.campaign.toScreen.setData(undefined, old => {
// 				if (!old || !old?.[0]) return old;

// 				const updatedCampaigns = [{ ...old[0] }];
// 				if (old?.[1]) updatedCampaigns.push(old?.[1]);

// 				return updatedCampaigns;
// 			});

// 			return { previousCampaigns };
// 		},

// 		onError: (err, variables, context) => {
// 			if (context?.previousCampaigns) {
// 				utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
// 			}
// 		},

// 		onSettled: (err, variables, context) => {
// 			console.log('status => ', status);
// 			// utils.campaign.toScreen.invalidate();
// 		},
// 	});

// 	const label = (
// 		<div className='flex flex-row items-center gap-1'>
// 			<span>Genres</span>
// 		</div>
// 	);

// 	return (
// 		<MultiSelectField
// 			name='genres'
// 			label={label}
// 			placeholder='Search for genres...'
// 			control={props.control}
// 			options={playlistGenreOptions ?? []}
// 			isFetchingOptions={isFetchingOptions}
// 			getItemId={item => item.name}
// 			displayValue={item => item.name}
// 			optTitle={option => option.name}
// 			optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
// 			valuesOnChangeDebounced={genres => {
// 				updateTrackGenres({
// 					trackId: props.trackId,
// 					genres: genres.map(genre => genre.name),
// 				});
// 			}}
// 			debounce={500}
// 			displayMode={'select'}
// 		/>
// 	);
// }

// export function TrackGenresField_PlaylistPitchLaunch(props: {
// 	trackId: string;
// 	control: Control<UpdatePlaylistPitchCampaign_LaunchSchema, unknown>;
// }) {
// 	const utils = api.useContext();

// 	const { data: playlistGenreOptions, isFetching: isFetchingOptions } =
// 		api.genre.allInPitchPlaylists.useQuery();

// 	const { mutate: updateTrackGenres, status } = api.track.updateGenres.useMutation({
// 		async onMutate() {
// 			await utils.campaign.toScreen.cancel();

// 			const previousCampaigns = utils.campaign.toScreen.getData();
// 			if (!previousCampaigns) return { previousCampaigns };

// 			utils.campaign.toScreen.setData(undefined, old => {
// 				if (!old || !old?.[0]) return old;

// 				const updatedCampaigns = [{ ...old[0] }];
// 				if (old?.[1]) updatedCampaigns.push(old?.[1]);

// 				return updatedCampaigns;
// 			});

// 			return { previousCampaigns };
// 		},

// 		onError: (err, variables, context) => {
// 			if (context?.previousCampaigns) {
// 				utils.campaign.toScreen.setData(undefined, context.previousCampaigns);
// 			}
// 		},

// 		onSettled: (err, variables, context) => {
// 			console.log('status => ', status);
// 			// utils.campaign.toScreen.invalidate();
// 		},
// 	});

// 	const label = (
// 		<div className='flex flex-row items-center gap-1'>
// 			<span>Genres</span>
// 		</div>
// 	);

// 	return (
// 		<MultiSelectField
// 			name='genres'
// 			label={label}
// 			placeholder='Search for genres...'
// 			control={props.control}
// 			options={playlistGenreOptions ?? []}
// 			isFetchingOptions={isFetchingOptions}
// 			getItemId={item => item.name}
// 			displayValue={item => item.name}
// 			optTitle={option => option.name}
// 			optSubtitle={option => `${option.totalPlaylists ?? '?'} playlists`}
// 			valuesOnChangeDebounced={genres => {
// 				updateTrackGenres({
// 					trackId: props.trackId,
// 					genres: genres.map(genre => genre.name),
// 				});
// 			}}
// 			debounce={500}
// 			displayMode={'select'}
// 		/>
// 	);
// }
