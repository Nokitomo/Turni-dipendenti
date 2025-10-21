export function calculateMonthlyHoursFromSchedule(schedule, shiftHours) {
  const result = {};

  for (const employee in schedule) {
    result[employee] = 0;
    for (const day in schedule[employee]) {
      const shift = schedule[employee][day];
      result[employee] += shiftHours[shift] || 0;
    }
  }

  return result;
}
