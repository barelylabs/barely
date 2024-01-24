import { useState } from "react";
import { cn } from "@barely/lib/utils/cn";

import { Icon } from "./icon";

export const Rating = (props: { value: number; onChange: () => void }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-row items-center gap-1">
      <button
        type="button"
        className="-ml-5 text-transparent"
        onClick={props.onChange}
      >
        <Icon.star className="-m-1 h-6 w-6 p-1" />
      </button>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = props.value >= star;
        const isHovered = hoverRating >= star;
        const isFilledButMoreThanHovered =
          hoverRating !== 0 && hoverRating < star && props.value >= star;

        return (
          <button type="button" key={star} className="active:scale-90">
            <Icon.star
              className={cn(
                "-m-1 h-6 w-6 p-1",
                isFilledButMoreThanHovered
                  ? "fill-yellow-300 text-yellow-300"
                  : isFilled
                    ? "fill-yellow-500 text-yellow-500"
                    : isHovered
                      ? "fill-yellow-300 text-yellow-300"
                      : "dark:fill-slate-200 dark:text-slate-200",
              )}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={props.onChange}
            />
          </button>
        );
      })}
    </div>
  );
};

const RatingDisplay = (props: { rating: number; by?: string }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-row items-center gap-1">
        {[1, 2, 3, 4, 5].map((star, starIndex) => {
          const isFilled = props.rating >= star;

          return (
            <Icon.star
              key={starIndex}
              className={cn(
                "-m-1 h-6 w-6 p-1",
                isFilled
                  ? "fill-yellow-500 text-yellow-500"
                  : "dark:fill-slate-200 dark:text-slate-200",
              )}
            />
          );
        })}
      </div>
      {props.by && (
        <span className="text-sm font-light text-muted-foreground/90">
          Reviewed by
          <span className="font-bold"> {props.by}</span>
        </span>
      )}
    </div>
  );
};
export { RatingDisplay };
