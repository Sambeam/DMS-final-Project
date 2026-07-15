export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SESSION_TYPES = ["lecture", "lab", "tutorial"];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const WEEKDAY_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};
export const INDEX_TO_WEEKDAY = Object.fromEntries(Object.entries(WEEKDAY_TO_INDEX).map(([day, idx]) => [idx, day]));

export const parseISODate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const clampYear = (value) => Math.min(2100, Math.max(2000, value));
