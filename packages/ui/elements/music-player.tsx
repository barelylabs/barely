"use client";

import React, { useCallback } from "react";
import { atomWithToggle } from "@barely/lib/atoms/atom-with-toggle";
import { cn } from "@barely/lib/utils/cn";
import { tFormatter } from "@barely/lib/utils/time";
import { atom, useAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import ReactPlayer from "react-player/lazy";

import type { TrackWithArtistAndMasters } from "@barely/lib/server/track.schema";

import { Button } from "./button";
import { Icon } from "./icon";
import { Slider } from "./slider";
import { videoPlayerGlobalCurrentAtom } from "./video-player";

export type MusicPlayerTrack = Pick<
  TrackWithArtistAndMasters,
  "id" | "name" | "workspace" | "imageUrl" | "masterMp3"
>;
export type MusicPlayerPlaylist = MusicPlayerTrack[];

interface Progress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

const playerAtom = atom<ReactPlayer | null>(null);
export const playingMusicAtom = atomWithToggle(false);
const seekingMusicAtom = atomWithToggle(false);
const progressMusicAtom = atom<Progress>({
  played: 0,
  playedSeconds: 0,
  loaded: 0,
  loadedSeconds: 0,
});
const durationMusicAtom = atom<number | undefined>(undefined);

export const playlistAtom = atom<MusicPlayerPlaylist>([]);
export const currentTrackAtom = atom<MusicPlayerTrack | undefined>(undefined);

export function useMusicPlayer() {
  const [player, setPlayer] = useAtom(playerAtom);
  const [playing, togglePlaying] = useAtom(playingMusicAtom);
  const [seeking, setSeeking] = useAtom(seekingMusicAtom);
  const [duration, setDuration] = useAtom(durationMusicAtom);
  const [progress, setProgress] = useAtom(progressMusicAtom);
  const [playlist, setPlaylist] = useAtom(playlistAtom);
  const [currentTrack, setCurrentTrack] = useAtom(currentTrackAtom);

  // video
  const [, setVideoGlobalCurrent] = useAtom(videoPlayerGlobalCurrentAtom);

  const ref = useCallback(
    (playerInstance: ReactPlayer | null) => {
      console.log("player instance updated:", playerInstance);
      setPlayer(playerInstance);
    },
    [setPlayer],
  );

  const seekTo = useCallback(
    (playedSeconds: number) => {
      if (player) {
        player.seekTo(playedSeconds);
      }
    },
    [player],
  );

  const togglePlay = useAtomCallback(
    useCallback(
      (get) => {
        const currentTrack = get(currentTrackAtom);
        const playlist = get(playlistAtom) ?? [];

        if (!currentTrack) {
          console.log("no current track");
          setVideoGlobalCurrent(false);
          setCurrentTrack(playlist[0]);
          setProgress({
            played: 0,
            playedSeconds: 0,
            loaded: 0,
            loadedSeconds: 0,
          });

          // return togglePlaying(true);
        }

        const definitelyCurrentTrack = get(currentTrackAtom);
        console.log("definitely current track", definitelyCurrentTrack);
        return togglePlaying();
      },
      [togglePlaying, setCurrentTrack, setProgress, setVideoGlobalCurrent],
    ),
  );

  const pauseMusic = useCallback(() => togglePlaying(false), [togglePlaying]);

  const goToPrevious = useAtomCallback(
    useCallback(
      (get) => {
        const playlist = get(playlistAtom);
        const progress = get(progressMusicAtom);
        const currentTrack = get(currentTrackAtom);
        const currentIndex = playlist.findIndex(
          (track) => track.id === currentTrack?.id,
        );
        const previousTrack = playlist[currentIndex - 1];
        if (
          (progress.playedSeconds > 1 && progress.playedSeconds < 5) ||
          !previousTrack
        ) {
          return seekTo(0);
        }

        setCurrentTrack(previousTrack);
        setProgress({
          played: 0,
          playedSeconds: 0,
          loaded: 0,
          loadedSeconds: 0,
        });
      },
      [seekTo, setCurrentTrack, setProgress],
    ),
  );

  const skipToNext = useAtomCallback(
    useCallback(
      (get) => {
        const playlist = get(playlistAtom);
        const currentTrack = get(currentTrackAtom);
        const currentIndex = playlist.findIndex(
          (track) => track.id === currentTrack?.id,
        );
        const nextTrack = playlist[currentIndex + 1];
        if (nextTrack) {
          setCurrentTrack(nextTrack);
          setProgress({
            played: 0,
            playedSeconds: 0,
            loaded: 0,
            loadedSeconds: 0,
          });
        }
      },
      [setCurrentTrack, setProgress],
    ),
  );

  const handlePlay = useCallback(() => {
    console.log("handle play");
    setVideoGlobalCurrent(false);
    togglePlaying(true);
  }, [togglePlaying, setVideoGlobalCurrent]);
  const handlePause = useCallback(() => {
    console.log("handle pause");
    togglePlaying(false);
  }, [togglePlaying]);
  const handleDuration = useCallback(
    (duration: number) => setDuration(duration),
    [setDuration],
  );

  const handleProgress = useCallback(
    (progress: Progress) => {
      if (!seeking) {
        setProgress(progress);
      }
    },
    [seeking, setProgress],
  );

  const handleSeekChange = useAtomCallback(
    useCallback(
      (get) => {
        const duration = get(durationMusicAtom);
        const progress = get(progressMusicAtom);
        return (value: number) => {
          setSeeking(true);
          setProgress({
            ...progress,
            played: value / (duration ?? 60),
            playedSeconds: value,
          });
        };
      },
      [setSeeking, setProgress],
    ),
  );
  const handleSeekCommit = () => {
    seekTo(progress.playedSeconds);
    setSeeking(false);
  };

  return {
    ref,
    player,
    currentTrack,
    playlist,
    setPlaylist,
    playing,

    seeking,
    setSeeking,
    duration,
    setDuration,
    progress,
    setProgress,
    // functions
    togglePlay,
    seekTo,
    skipToNext,
    goToPrevious,
    pauseMusic,
    // handle
    handlePlay,
    handlePause,
    handleDuration,
    handleProgress,
    handleSeekChange,
    handleSeekCommit,
  };
}

export function HeadlessMusicPlayer() {
  const {
    ref,
    currentTrack,
    playing,
    handlePlay,
    handlePause,
    handleDuration,
    handleProgress,
  } = useMusicPlayer();

  return (
    <ReactPlayer
      ref={ref}
      url={currentTrack?.masterMp3.url}
      width="100%"
      height="100%"
      playing={playing}
      onPlay={handlePlay}
      onPause={handlePause}
      onDuration={handleDuration}
      onProgress={handleProgress}
      progressInterval={10}
      onReady={() => console.log("ready")}
    />
  );
}

export function MusicPlayerBar() {
  const { currentTrack, playlist } = useMusicPlayer();

  const currentOrFirstTrack = currentTrack ?? playlist[0];

  return (
    <>
      <div className="fixed bottom-0 h-[72px] w-full">
        <div className="mx-auto h-full w-full max-w-5xl flex-row items-center justify-center sm:px-4 lg:px-6">
          <div className="grid h-full w-full grid-cols-[3fr_1fr] gap-4 sm:grid-cols-[minmax(200px,_1fr)_minmax(300px,_2fr)_minmax(0px,_1fr)]">
            {/* Album Art */}
            <div className="flex h-full flex-row gap-3 px-4 py-4 sm:px-0">
              {currentOrFirstTrack && (
                <>
                  <picture>
                    <img
                      alt={currentOrFirstTrack.name}
                      src={currentOrFirstTrack.imageUrl ?? ""}
                      className="h-11  w-11 rounded-xs"
                    />
                  </picture>
                  <div className="flex flex-col items-start justify-center gap-[2px]">
                    <p className="text-xs md:text-sm">
                      {currentOrFirstTrack.name}
                    </p>
                    <p className="text-2xs font-light md:text-xs">
                      {currentOrFirstTrack.workspace.name}
                    </p>
                  </div>
                </>
              )}
            </div>
            {/* Music Player */}
            <div className="hidden max-w-full flex-grow flex-col items-center justify-center gap-1 sm:flex ">
              <div className="flex w-full flex-row items-center justify-center gap-3">
                <MusicPreviousButton />
                <MusicPlayButton size="small" />
                <MusicNextButton />
              </div>
              <MusicSeek />
            </div>

            <div className="flex flex-row items-center justify-end p-4 sm:hidden">
              <MusicPlayButton size="small" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MusicSeek() {
  const { duration, progress, handleSeekChange, handleSeekCommit } =
    useMusicPlayer();

  return (
    <div className="flex w-full max-w-[400px] flex-row items-center justify-center gap-2">
      <p className="w-[40px] text-right text-[11px]">
        {tFormatter(progress.playedSeconds)}
      </p>
      <Slider
        value={[progress.playedSeconds]}
        max={duration}
        onValueChange={(v) => handleSeekChange()(v)}
        onValueCommit={handleSeekCommit}
        className="w-full"
        trackClassName="h-1"
        hideThumb
      />
      <p className="w-[40px] text-right text-[11px]">{tFormatter(duration)}</p>
    </div>
  );
}

export function MusicPlayButton({
  size = "small",
}: {
  size?: "icon" | "small" | "large";
}) {
  const { playing, togglePlay } = useMusicPlayer();

  return (
    <Button
      size="icon"
      icon
      pill
      className={cn(
        size === "large"
          ? "h-12 w-12"
          : size === "small"
            ? "h-8 w-8"
            : "h-6 w-6",
      )}
      onClick={() => togglePlay()}
    >
      {playing ? (
        <Icon.pause
          fill="black"
          className={cn(
            "w-full rounded-full text-black",
            size === "small" ? "p-1" : size === "icon" ? "p-2" : "",
          )}
        />
      ) : (
        <Icon.play
          fill="black"
          className={cn(
            "ml-1 w-full rounded-full  text-black",
            size === "small" ? "p-1" : size === "icon" ? "p-2" : "",
          )}
        />
      )}
    </Button>
  );
}

export function MusicPreviousButton() {
  const { goToPrevious } = useMusicPlayer();
  return (
    <Button
      icon
      variant="link"
      size="icon"
      pill
      className="h-6 w-6"
      onClick={() => goToPrevious()}
    >
      <Icon.skipBackward fill="gray-500" className="w-full text-white" />
    </Button>
  );
}

export function MusicNextButton() {
  const { skipToNext } = useMusicPlayer();
  return (
    <Button
      icon
      variant="link"
      size="icon"
      pill
      className="h-6 w-6"
      onClick={() => skipToNext()}
    >
      <Icon.skipForward fill="gray-500" className="w-full text-white" />
    </Button>
  );
}
