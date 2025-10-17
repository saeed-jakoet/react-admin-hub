import { lastDayOfMonth, startOfWeek, addWeeks } from "date-fns";

/**
 * Given a week number and year, returns the last day of the month that contains the first day of that week.
 * @param {number} weekNumber - ISO week number (1-53)
 * @param {number} year - Full year (e.g. 2025)
 * @returns {Date} Last day of the month for the week
 */
export function getDueDateForWeek(weekNumber, year) {
  // ISO week: week starts on Monday
  // Find the first day of the year
  const jan4 = new Date(year, 0, 4); // Jan 4th is always in week 1
  const firstWeekStart = startOfWeek(jan4, { weekStartsOn: 1 });
  // Calculate the first day of the target week
  const weekStart = addWeeks(firstWeekStart, weekNumber - 1);
  // Get the last day of the month for that week
  return lastDayOfMonth(weekStart);
}
