const HOME_PATH_PATTERN = /^(?:Users|home)\/[^/]+\/(?:Developer\/)?/;

export const truncateProjectName = (name: string, maxWidth: number): string => {
  const shortName = name.replace(HOME_PATH_PATTERN, "");
  if (shortName.length <= maxWidth) return shortName.padEnd(maxWidth);
  return "…" + shortName.slice(-(maxWidth - 1));
};
