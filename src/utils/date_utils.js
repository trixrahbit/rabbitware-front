import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { parseISO } from 'date-fns';

/**
 * Converts a UTC date to the application's timezone
 * @param {Date|string} date - The date to convert (Date object or ISO string)
 * @param {string} timezone - The timezone to convert to (e.g., 'UTC', 'America/New_York')
 * @param {string} formatStr - Optional format string for the output (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns {string} The formatted date in the specified timezone
 */
export const formatInTimezone = (date, timezone = 'UTC', formatStr = 'yyyy-MM-dd HH:mm:ss') => {
  if (!date) return '';
  
  // Parse the date if it's a string
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Convert the UTC date to the specified timezone
  const zonedDate = utcToZonedTime(dateObj, timezone);
  
  // Format the date according to the format string
  return format(zonedDate, formatStr, { timeZone: timezone });
};

/**
 * Converts a date in the application's timezone to UTC
 * @param {Date|string} date - The date to convert (Date object or ISO string)
 * @param {string} timezone - The timezone the date is in (e.g., 'UTC', 'America/New_York')
 * @returns {Date} The date converted to UTC
 */
export const convertToUTC = (date, timezone = 'UTC') => {
  if (!date) return null;
  
  // Parse the date if it's a string
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Convert the date from the specified timezone to UTC
  return zonedTimeToUtc(dateObj, timezone);
};

/**
 * Gets the current date and time in the application's timezone
 * @param {string} timezone - The timezone to get the current date in (e.g., 'UTC', 'America/New_York')
 * @param {string} formatStr - Optional format string for the output (default: 'yyyy-MM-dd HH:mm:ss')
 * @returns {string} The current date and time in the specified timezone
 */
export const getCurrentDateInTimezone = (timezone = 'UTC', formatStr = 'yyyy-MM-dd HH:mm:ss') => {
  const now = new Date();
  return formatInTimezone(now, timezone, formatStr);
};