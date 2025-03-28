// src/pages/CalendarPage.jsx
import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  getDay,
  getDaysInMonth,
} from "date-fns";
import "./CalendarPage.css"; // Import the CSS file

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // Generate placeholder events
  useEffect(() => {
    const today = new Date();
    const placeholderEvents = [
      {
        id: "event1",
        title: "Golf Tournament",
        segmentTitle: "Adults Division",
        date: new Date(today.getFullYear(), today.getMonth(), 15),
        time: "09:00",
        location: "City Golf Course",
        registrationId: "golf",
      },
      {
        id: "event2",
        title: "Pickleball Tournament",
        segmentTitle: "Open Division",
        date: new Date(today.getFullYear(), today.getMonth(), 22),
        time: "10:00",
        location: "Community Center",
        registrationId: "pickleball",
      },
      {
        id: "event3",
        title: "Community BBQ",
        date: new Date(today.getFullYear(), today.getMonth(), 28),
        time: "17:00",
        location: "City Park",
        registrationId: "bbq",
      },
    ];
    setEvents(placeholderEvents);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of month (0 = Sunday, 1 = Monday, etc)
    const firstDayOfMonth = getDay(monthStart);

    // Get number of days in the month
    const daysInMonth = getDaysInMonth(currentDate);

    // Create an array for all days to display
    const daysArray = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      );
    }

    // Calculate total number of rows needed
    const totalRows = Math.ceil(daysArray.length / 7);

    // Split days into rows (weeks)
    const weeksArray = [];
    for (let i = 0; i < totalRows; i++) {
      weeksArray.push(daysArray.slice(i * 7, (i + 1) * 7));
    }

    return (
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={handlePreviousMonth}>&lt; Previous</button>
          <h2>{format(currentDate, "MMMM yyyy")}</h2>
          <button onClick={handleNextMonth}>Next &gt;</button>
        </div>

        <div className="calendar-grid">
          <div className="calendar-row">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          {weeksArray.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="calendar-row">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${dayIndex}`}
                      className="calendar-day empty"
                    ></div>
                  );
                }

                const dayEvents = events.filter((event) =>
                  isSameDay(event.date, day)
                );

                return (
                  <div key={`day-${dayIndex}`} className="calendar-day">
                    <div className="day-number">{format(day, "d")}</div>
                    {dayEvents.length > 0 && (
                      <div className="day-events">
                        {dayEvents.map((event) => (
                          <div key={event.id} className="day-event">
                            <div className="event-time">
                              {format(
                                parseISO(`2024-01-01T${event.time}`),
                                "h:mm a"
                              )}
                            </div>
                            <div className="event-title">{event.title}</div>
                            {event.segmentTitle && (
                              <div className="event-segment">
                                {event.segmentTitle}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Event Calendar</h1>

      <div className="paper p-3">{renderCalendar()}</div>
    </div>
  );
};

export default CalendarPage;
