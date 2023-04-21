// https://ui.shadcn.com/docs/primitives/aspect-ratio

'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

/* usage

import Image from "next/image"
import { AspectRatio } from "@/components/ui/aspect-ratio"

<div className="w-[450px]">
  <AspectRatio ratio={16 / 9}>
    <Image
      src="https://images.unsplash.com/photo-1576075796033-848c2a5f3696?w=800&dpr=2&q=80"
      alt="Photo by Alvaro Pinot"
      fill
      className="rounded-md object-cover"
    />
  </AspectRatio>
</div>

*/
