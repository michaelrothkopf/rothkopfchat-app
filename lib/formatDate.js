const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// The number of milliseconds in a second
const ONE_SECOND = 1000;
// The number of milliseconds in a minute
const ONE_MINUTE = ONE_SECOND * 60;
// The number of milliseconds in an hour
const ONE_HOUR = ONE_MINUTE * 60;
// The number of milliseconds in a day
const ONE_DAY = ONE_HOUR * 24;
// The number of milliseconds in two days
const TWO_DAYS = ONE_DAY * 2;
// The number of milliseconds in a week
const ONE_WEEK = ONE_DAY * 7;

/**
 * Formats a date into a time ago if it is recent and a date if it is not
 * @param {Date} original The date to compare the current time to
 * @param {boolean} useSeconds Whether to show "seconds" if the difference is less than a minute, "<1m ago" if false
 * @returns A string containing how long ago the date was if it is recent, or the date and time if it is not
 */
const formatDate = (original, useSeconds=true) => {
  // Get a date for the current time
  const now = new Date();

  // Get the difference between the two dates
  const diff = now.getTime() - original.getTime();

  // If the date was within the last second (or, by extension, negative)
  if (diff < ONE_SECOND) {
    return 'just now';
  }

  // If the date was within the last minute
  if (diff < ONE_MINUTE) {
    if (useSeconds) {
      return `${Math.floor(diff / ONE_SECOND)}s ago`;
    }
    return `<1m ago`;
  }

  // If the date was within the last hour
  if (diff < ONE_HOUR) {
    return `${Math.floor(diff / ONE_MINUTE)}m ago`;
  }

  // If the date was within the last day
  if (diff < ONE_DAY) {
    return `${Math.floor(diff / ONE_HOUR)}h ago`;
  }

  // If the date was yesterday
  if (diff < TWO_DAYS) {
    return 'yesterday';
  }

  // If the date was within the last week
  if (diff < ONE_WEEK) {
    return `${WEEKDAY_NAMES[original.getDay()]}`;
  }

  // Return a formatted date instead
  return `${MONTH_NAMES[original.getMonth()]} ${original.getDate()} at ${original.toLocaleTimeString()}`;
}

export default formatDate;