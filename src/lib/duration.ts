export const calculateDurationSeconds = (
  startedAt?: Date,
  completedAt?: Date
): number | undefined => {
  if (!startedAt || !completedAt) {
    return undefined;
  }

  const diffMs = completedAt.getTime() - startedAt.getTime();

  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return undefined;
  }

  return Math.floor(diffMs / 1000);
};

export const formatDurationLabel = (
  seconds?: number
): string | undefined => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return undefined;
  }

  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  const parts: string[] = [];

  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes) {
    parts.push(`${minutes}m`);
  }

  if (remainingSeconds || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(" ");
};
