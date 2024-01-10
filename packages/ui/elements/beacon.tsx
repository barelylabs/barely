import { cn } from "@barely/lib/utils/cn";

interface BeaconProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Beacon = ({ className }: BeaconProps) => {
  return (
    <span
      className={cn(
        "absolute right-0 top-1 z-40 flex h-4 w-4 animate-bounce items-center justify-center",
        className,
      )}
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-65" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500" />
    </span>
  );
};

export { Beacon };
