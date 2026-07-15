import { Clock, CalendarDays, Sparkles, Download, Edit, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { WEEK_DAYS, MONTH_NAMES, WEEKDAY_TO_INDEX, INDEX_TO_WEEKDAY, parseISODate, clampYear } from "../utils/calendar.js";

export default function CalendarPage({
  classes,
  courses,
  holidays,
  holidayError,
  holidaysLoading,
  calendarMonth,
  calendarYear,
  setCalendarMonth,
  setCalendarYear,
  exportICS,
  openScheduleModal,
}) {
  const timeSlots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM"];

  const getClassesForDay = (day) => classes.filter((c) => c.dayOfWeek === day);
  const to24h = (label) => {
    const map = {
      "8 AM": "08:00",
      "9 AM": "09:00",
      "10 AM": "10:00",
      "11 AM": "11:00",
      "12 PM": "12:00",
      "1 PM": "13:00",
      "2 PM": "14:00",
      "3 PM": "15:00",
      "4 PM": "16:00",
    };
    return map[label];
  };

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 0) {
        setCalendarYear((year) => clampYear(year - 1));
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      if (prev === 11) {
        setCalendarYear((year) => clampYear(year + 1));
        return 0;
      }
      return prev + 1;
    });
  };

  const handleMonthSelect = (value) => {
    setCalendarMonth(Number(value));
  };

  const handleYearSelect = (value) => {
    setCalendarYear(clampYear(Number(value)));
  };

  const getFirstDateForDay = (day) => {
    const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
    const targetIndex = WEEKDAY_TO_INDEX[day];
    let diff = targetIndex - firstOfMonth.getDay();
    if (diff < 0) diff += 7;
    return new Date(calendarYear, calendarMonth, 1 + diff);
  };

  const dayDateMap = WEEK_DAYS.reduce((acc, day) => {
    acc[day] = getFirstDateForDay(day);
    return acc;
  }, {});

  const monthHolidays = holidays
    .map((holiday) => ({ ...holiday, dateObj: parseISODate(holiday.date) }))
    .filter((holiday) => holiday.dateObj.getMonth() === calendarMonth);

  const dayHolidayMap = WEEK_DAYS.reduce((acc, day) => {
    acc[day] = monthHolidays.filter((holiday) => INDEX_TO_WEEKDAY[holiday.dateObj.getDay()] === day);
    return acc;
  }, {});
  const holidayWeekdays = new Set(WEEK_DAYS.filter((day) => dayHolidayMap[day].length > 0));

  const monthLabel = MONTH_NAMES[calendarMonth] + " " + calendarYear;
  const yearOptions = Array.from({ length: 11 }, (_, idx) => calendarYear - 5 + idx).filter(
    (year) => year >= 2000 && year <= 2100
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Weekly Timetable</h2>
          <p className="text-gray-600">Your class schedule at a glance</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-50">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="px-4 py-2 text-sm font-semibold text-gray-800 whitespace-nowrap">{monthLabel}</div>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex gap-3">
              <select
                value={calendarMonth}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                value={calendarYear}
                onChange={(e) => handleYearSelect(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportICS}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export .ics
            </button>
            <button
              onClick={() => openScheduleModal(false)}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Schedule
            </button>
            <button
              onClick={() => openScheduleModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Class
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Clock className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule</h3>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <p className="text-sm font-semibold text-blue-900">Nigerian Holidays in {monthLabel}</p>
          </div>
          {holidaysLoading ? (
            <p className="text-sm text-gray-600">Loading holiday data...</p>
          ) : holidayError ? (
            <p className="text-sm text-red-600">{holidayError}</p>
          ) : monthHolidays.length === 0 ? (
            <p className="text-sm text-gray-600">No Nigerian public holidays in {monthLabel}.</p>
          ) : (
            <div className="space-y-2">
              {monthHolidays.map((holiday) => (
                <div
                  key={holiday.date}
                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm border border-blue-100"
                >
                  <span className="font-medium text-gray-900">{holiday.localName}</span>
                  <span className="text-gray-500">
                    {holiday.dateObj.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 p-3 text-left font-semibold text-gray-700">Time</th>
                {WEEK_DAYS.map((day) => (
                  <th
                    key={day}
                    className={
                      "border border-gray-200 p-3 text-left font-semibold " +
                      (holidayWeekdays.has(day) ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-700")
                    }
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span>{day}</span>
                        <span className="text-xs text-gray-500">
                          {dayDateMap[day].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {dayHolidayMap[day].length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dayHolidayMap[day].map((holiday) => (
                            <span key={day + "-" + holiday.date} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              {holiday.localName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>
                  <td className="border border-gray-200 p-3 text-gray-600 font-medium">{time}</td>
                  {WEEK_DAYS.map((day) => {
                    const dayClasses = getClassesForDay(day).filter((c) => c.startTime === to24h(time));
                    return (
                      <td
                        key={day}
                        className={
                          "border border-gray-200 p-2 align-top " + (holidayWeekdays.has(day) ? "bg-amber-50" : "")
                        }
                      >
                        {dayClasses.map((c) => {
                          const course = courses.find((x) => x._id === c.courseId);
                          const typeColors = {
                            lecture: "bg-blue-100 border-blue-500 text-blue-700",
                            lab: "bg-purple-100 border-purple-500 text-purple-700",
                            tutorial: "bg-green-100 border-green-500 text-green-700",
                          };
                          return (
                            <div key={c.id} className={typeColors[c.type] + " border-l-4 rounded p-2 text-xs mb-2"}>
                              <div className="font-semibold mb-1">{course?.course_code}</div>
                              <div className="flex items-center mb-1">
                                <span className="px-1.5 py-0.5 bg-white/50 rounded text-xs">{c.type}</span>
                              </div>
                              <div className="text-gray-600 flex items-center">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {c.location}
                              </div>
                              <div className="text-gray-600">
                                {c.startTime} - {c.endTime}
                              </div>
                            </div>
                          );
                        })}
                        {dayHolidayMap[day].length > 0 && (
                          <div className="mt-2 text-xs text-amber-700 space-y-1">
                            {dayHolidayMap[day].map((holiday) => (
                              <div key={day + "-detail-" + holiday.date}>
                                {holiday.localName} (
                                {holiday.dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })})
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
