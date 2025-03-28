// src/pages/EventsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAPI } from "../hooks/useAPI";
import { format, parseISO } from "date-fns";

const EventsPage = () => {
  const { getPublishedEvents, getRegistrations, loading, error } = useAPI();
  const [eventsByDay, setEventsByDay] = useState({});
  const [registrationsByEvent, setRegistrationsByEvent] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPublishedEvents();

        // Fetch registrations for each event
        const registrationsData = {};
        for (const event of data.events) {
          if (event.registrationId) {
            const registrations = await getRegistrations(event.registrationId);
            registrationsData[event.registrationId] =
              registrations.registrants || [];
          }
        }
        setRegistrationsByEvent(registrationsData);

        // Group events by day (existing logic)
        const grouped = data.events.reduce((acc, event) => {
          if (event.segments) {
            event.segments.forEach((segment) => {
              const dayKey = format(parseISO(segment.date), "MMM d");
              if (!acc[dayKey]) {
                acc[dayKey] = [];
              }

              const existingEvent = acc[dayKey].find((e) => e.id === event.id);

              if (!existingEvent) {
                const daySegments = event.segments.filter(
                  (s) => format(parseISO(s.date), "MMM d") === dayKey
                );

                const otherDays = [
                  ...new Set(
                    event.segments
                      .filter(
                        (s) => format(parseISO(s.date), "MMM d") !== dayKey
                      )
                      .map((s) => format(parseISO(s.date), "MMM d"))
                  ),
                ];

                acc[dayKey].push({
                  ...event,
                  daySegments,
                  otherDays,
                });
              }
            });
          } else {
            const dayKey = format(parseISO(event.date), "MMM d");
            if (!acc[dayKey]) {
              acc[dayKey] = [];
            }
            acc[dayKey].push(event);
          }
          return acc;
        }, {});

        // Sort days (existing logic)
        const sortedGrouped = Object.fromEntries(
          Object.entries(grouped).sort((a, b) => {
            const getDateFromDay = (dayKey) => {
              const event = data.events.find((e) => {
                if (e.segments) {
                  return e.segments.some(
                    (s) => format(parseISO(s.date), "MMM d") === dayKey
                  );
                }
                return format(parseISO(e.date), "MMM d") === dayKey;
              });

              if (event) {
                if (event.segments) {
                  return parseISO(event.segments[0].date);
                }
                return parseISO(event.date);
              }
              return new Date(0);
            };

            const dateA = getDateFromDay(a[0]);
            const dateB = getDateFromDay(b[0]);
            return dateA.getTime() - dateB.getTime();
          })
        );

        setEventsByDay(sortedGrouped);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [getPublishedEvents, getRegistrations]);

  const getRegistrationCount = (event, segmentId = null) => {
    const registrations = registrationsByEvent[event.registrationId] || [];
    if (segmentId) {
      return registrations.filter((r) => r.segmentId === segmentId).length;
    }
    return registrations.length;
  };

  const renderEventCard = (event, currentDay) => (
    <div className="card event-card">
      <div className="card-body event-card-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-location">{event.location}</p>
        <p className="event-description">{event.description}</p>

        {event.daySegments ? (
          <div className="event-segments">
            {event.daySegments.map((segment) => (
              <div className="event-segment" key={segment.id}>
                <p>
                  {segment.title} |{" "}
                  {format(parseISO(`2024-01-01T${segment.time}`), "h:mm a")}
                  {` | Teams: ${getRegistrationCount(event, segment.id)}`}
                  {segment.maxTeams && ` / ${segment.maxTeams}`}
                  {segment.maxParticipants &&
                    ` | Participants: ${getRegistrationCount(
                      event,
                      segment.id
                    )} / ${segment.maxParticipants}`}
                </p>
              </div>
            ))}

            {event.otherDays && event.otherDays.length > 0 && (
              <p className="event-other-days">
                Also on: {event.otherDays.join(", ")}
              </p>
            )}
          </div>
        ) : (
          <p className="event-segment">
            {format(parseISO(`2024-01-01T${event.time}`), "h:mm a")}
            {` | Participants: ${getRegistrationCount(event)}`}
            {event.maxParticipants && ` / ${event.maxParticipants}`}
          </p>
        )}

        <Link
          to={`/events/${event.registrationId}`}
          className="btn btn-primary btn-full event-register-button"
        >
          Event Details & Registration
        </Link>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <p className="text-error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Country Fair Days 2025 Events</h1>

      {Object.entries(eventsByDay).map(([day, events]) => (
        <div className="event-day" key={day}>
          <h2 className="event-day-title">{day}</h2>
          <div className="event-day-grid">
            {events.map((event) => (
              <div key={event.id}>{renderEventCard(event, day)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsPage;
