import { useState } from "react";

function AttendanceCalendar({ attendanceDates = [], attendanceNotes = {}, onDateToggle }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getDateStr = (day) => {
    const { year, month } = getDaysInMonth(currentMonth);
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isAttendanceDay = (day) => {
    return attendanceDates.includes(getDateStr(day));
  };

  const hasNotes = (day) => {
    const dateStr = getDateStr(day);
    return attendanceNotes[dateStr] && attendanceNotes[dateStr].length > 0;
  };

  const handleDayClick = (day) => {
    const { year, month } = getDaysInMonth(currentMonth);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onDateToggle) {
      onDateToggle(dateStr);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  return (
    <div className="attendance-calendar">
      <div className="calendar-header">
        <button type="button" onClick={previousMonth} className="calendar-nav">‹</button>
        <h4 className="calendar-month">{monthName} {year}</h4>
        <button type="button" onClick={nextMonth} className="calendar-nav">›</button>
      </div>

      <div className="calendar-weekdays">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="calendar-weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="calendar-day blank"></div>
        ))}
        {days.map((day) => {
          const dateStr = getDateStr(day);
          const attended = isAttendanceDay(day);
          const withNotes = hasNotes(day);

          return (
            <button
              key={day}
              type="button"
              className={`calendar-day ${attended ? 'attended' : ''} ${withNotes ? 'has-notes' : ''}`}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <span className="day-number">{day}</span>
              {attended && (
                <span className={`butterfly-marker ${withNotes ? 'with-notes' : ''}`}>
                  🦋
                </span>
              )}
              {hoveredDay === day && withNotes && attendanceNotes[dateStr] && (
                <div className="calendar-note-tooltip">
                  {attendanceNotes[dateStr]}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AttendanceCalendar;
