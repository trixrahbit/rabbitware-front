import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { formatInTimezone, convertToUTC, getCurrentDateInTimezone } from '../utils/date_utils';

/**
 * Custom hook to provide timezone-related functions using the application's timezone setting
 * @returns {Object} Object containing timezone-related functions and the current timezone
 */
export const useTimezone = (options = {}) => {
  const { fromSettings = false } = options;
  const { settings } = useSettings();
  const { currentUser } = useAuth();

  const timezone = fromSettings
    ? settings?.general?.timezone || 'UTC'
    : currentUser?.time_zone || settings?.general?.timezone || 'UTC';

  /**
   * Formats a date in the application's timezone
   * @param {Date|string} date - The date to format
   * @param {string} formatStr - Optional format string
   * @returns {string} The formatted date
   */
  const formatDate = (date, formatStr = 'yyyy-MM-dd HH:mm:ss') => {
    return formatInTimezone(date, timezone, formatStr);
  };

  /**
   * Converts a date to UTC from the application's timezone
   * @param {Date|string} date - The date to convert
   * @returns {Date} The UTC date
   */
  const toUTC = (date) => {
    return convertToUTC(date, timezone);
  };

  /**
   * Gets the current date in the application's timezone
   * @param {string} formatStr - Optional format string
   * @returns {string} The current date
   */
  const getCurrentDate = (formatStr = 'yyyy-MM-dd HH:mm:ss') => {
    return getCurrentDateInTimezone(timezone, formatStr);
  };

  return {
    formatDate,
    toUTC,
    getCurrentDate,
    timezone
  };
};

export const useSettingsTimezone = () => useTimezone({ fromSettings: true });

export default useTimezone;