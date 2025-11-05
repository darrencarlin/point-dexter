/**
 * Format time in seconds as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get Tailwind color class based on time remaining
 */
export function getTimerColorClass(
  timeRemaining: number | null,
  timeLimit: number
): string {
  if (timeRemaining === null) return "text-primary";

  const percentage = (timeRemaining / timeLimit) * 100;

  if (percentage === 0) return "text-destructive";
  if (percentage <= 10) return "text-red-600";
  if (percentage <= 30) return "text-orange-500";
  if (percentage <= 50) return "text-yellow-500";

  return "text-green-500";
}
