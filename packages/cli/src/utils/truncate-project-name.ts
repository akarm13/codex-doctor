const HOME_PATH_PATTERN = /^(?:Users\/[^/]+|home\/[^/]+)\/(?:Developer\/)?/;

export const stripProjectPath = (name: string): string =>
  name.replace(HOME_PATH_PATTERN, "");

export const truncateProjectName = (name: string, maxWidth: number): string => {
  const shortName = stripProjectPath(name);
  if (shortName.length <= maxWidth) return shortName.padEnd(maxWidth);
  return "…" + shortName.slice(-(maxWidth - 1));
};
