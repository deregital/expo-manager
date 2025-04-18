export function toInputValueString(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '/');
}

export function applyHoursAndMinutesToDate(
  initialDate: string,
  targetDate: string
): Date {
  const date = new Date(initialDate.replace(/-/g, '/').split('T')[0]);
  const [hours, minutes] = targetDate.split(':');
  date.setMinutes(Number(minutes));
  date.setHours(Number(hours));

  return date;
}

export function applyFullDateToDate(
  initialDate: string,
  dateToApply: Date
): Date {
  const date = new Date(initialDate.replace(/-/g, '/').split('T')[0]);
  const [year, month, day] = dateToApply.toISOString().split('T')[0].split('-');

  date.setFullYear(Number(year));
  date.setMonth(Number(month) - 1);
  date.setDate(Number(day));

  return date;
}
