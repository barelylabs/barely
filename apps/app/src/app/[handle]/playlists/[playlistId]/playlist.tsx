"use client";

import { onPromise } from "@barely/lib/utils/on-promise";
import { api } from "@barely/server/api/react";
import { Badge } from "@barely/ui/elements/badge";
import { Button } from "@barely/ui/elements/button";
import { Card } from "@barely/ui/elements/card";
import { Icon } from "@barely/ui/elements/icon";
import { H, Text } from "@barely/ui/elements/typography";

const Playlist = (props: { id: string }) => {
  const utils = api.useContext();
  const [playlist] = api.playlist.byId.useSuspenseQuery(props.id);

  const { mutateAsync: estimateGenres, isPending } =
    api.playlist.estimateGenresById.useMutation({
      onSuccess: async () => {
        await utils.playlist.byId.invalidate(props.id);
      },
    });

  if (!playlist) return null;

  return (
    <Card>
      <H size="2">{playlist.name}</H>
      <H size="4">{playlist.providerAccounts[0]?.username}</H>
      <div className="flex flex-row items-center gap-2">
        <Text variant="md/medium">Genres</Text>
        <Button
          loading={isPending}
          onClick={onPromise(() => estimateGenres(props.id))}
          variant="ghost"
          icon
          pill
        >
          <Icon.magic className="h-3 w-3 text-orange-300" />
        </Button>
      </div>
      <div className="flex flex-row flex-wrap items-center gap-2">
        {playlist.genres.map((genre, index) => (
          <Badge key={`${genre.id}.${index}`} size="sm" variant="subtle">
            {genre.name}
          </Badge>
        ))}
      </div>
      {/* <pre>{JSON.stringify(playlist.genres, null, 2)}</pre> */}
    </Card>
  );
};

export { Playlist };
