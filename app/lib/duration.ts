/**
 * Formats a number of seconds into a human-readable string.
 *
 * Usage:
 *   formatSeconds(45);      // "45s"
 *   formatSeconds(75);      // "1m"
 *   formatSeconds(3675);    // "1h 1m"
 *
 * @param seconds - The number of seconds to format.
 * @returns A string representing the formatted duration.
 */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  // Calculate hours, minutes and seconds remaining.
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  // Build result string.
  let result = "";

  if (hours > 0) {
    result += `${hours}h `;
  }

  if (minutes > 0 || hours === 0) {
    result += `${minutes}m`;
  }

  // Remove space at the end if any.
  return result.trim();
}

