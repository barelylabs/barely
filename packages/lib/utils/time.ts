const MS_IN_MIN = 60 * 1000;
const MS_IN_HOUR = MS_IN_MIN * 60;
const MS_IN_DAY = MS_IN_HOUR * 24;
const MS_IN_WEEK = MS_IN_DAY * 7;

export { MS_IN_MIN, MS_IN_HOUR, MS_IN_DAY, MS_IN_WEEK };

export function tFormatter(
  seconds?: number,
  opts: { showHours?: boolean } = {},
) {
  if (!seconds) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formattedHours = hours < 10 ? `${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `${minutes}` : `${minutes}`;
  const formattedSeconds =
    secs < 10 ? `0${secs.toFixed(0)}` : `${secs.toFixed(0)}`;

  // Determine if hours should be shown
  const showHours =
    (hours > 0 && opts.showHours !== false) || opts.showHours === true;

  if (showHours) {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    // If minutes is 0, it should also not prepend a 0
    return `${formattedMinutes === "0" ? "0" : formattedMinutes}:${formattedSeconds}`;
  }
}
