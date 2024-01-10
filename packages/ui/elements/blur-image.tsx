"use client";

import type { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@barely/lib/utils/cn";

export function BlurImage(props: ImageProps) {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(props.src);
  useEffect(() => setSrc(props.src), [props.src]); // update the `src` value when the `prop.src` value changes

  return (
    <Image
      {...props}
      src={src}
      alt={props.alt}
      className={cn(loading ? "blur-[2px]" : "blur-0", props.className)}
      onLoad={() => {
        setLoading(false);
      }}
      onError={() => {
        setSrc(`https://avatar.vercel.sh/${props.alt}`); // if the image fails to load, use the default avatar
      }}
      unoptimized
    />
  );
}
