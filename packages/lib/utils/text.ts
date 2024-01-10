export function underscoresToSpaces(str: string) {
  return str.replace(/_/g, " ");
}

// function to make string title case

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number) {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
}
