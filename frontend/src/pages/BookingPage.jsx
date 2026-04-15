import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths, isSameMonth, isSameDay, isToday,
  isBefore, startOfDay, parseISO, addDays, eachDayOfInterval
} from 'date-fns';
import { getEventTypeBySlug, getAvailableSlots } from '../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [eventType, setEventType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Load event type
  useEffect(() => {
    getEventTypeBySlug(slug)
      .then(res => setEventType(res.data))
      .catch(() => setError('Event type not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Load slots when date selected
  useEffect(() => {
    if (!selectedDate || !eventType) return;
    setSlotsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    getAvailableSlots(eventType.id, dateStr)
      .then(res => setSlots(res.data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, eventType]);

  const handleSelectTime = (slot) => {
    navigate(`/book/${slug}/details`, {
      state: { slot, eventType },
    });
  };

  // Build calendar grid
  const buildCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  };

  const days = buildCalendarDays();
  const today = startOfDay(new Date());

  if (loading) return (
    <div className="booking-page">
      <div className="loading-spinner"><div className="spinner" /></div>
    </div>
  );

  if (error) return (
    <div className="booking-page">
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">Event not found</h3>
        <p className="empty-desc">This booking link may be invalid or has been removed.</p>
      </div>
    </div>
  );

  return (
    <div className="booking-page">
      {/* Branding */}
      <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, cursor: 'pointer' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff'
        }}>S</div>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Schedulo</span>
      </div>

      <div className="booking-card">
        {/* Left info panel */}
        <div className="booking-event-info">
          <div className="booking-host-avatar">A</div>
          <div className="booking-host-name">Aditya Gupta</div>
          <div className="booking-event-title">{eventType.name}</div>

          <div className="booking-meta-item">
            <span className="booking-meta-icon">⏱</span>
            <span>{eventType.duration} min</span>
          </div>
          {eventType.location && (
            <div className="booking-meta-item">
              <span className="booking-meta-icon">📍</span>
              <span>{eventType.location}</span>
            </div>
          )}
          {eventType.description && (
            <p className="booking-event-desc">{eventType.description}</p>
          )}

          {selectedDate && (
            <div style={{
              marginTop: 'auto',
              padding: '12px',
              background: 'var(--primary-light)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--primary)',
              fontWeight: 600,
            }}>
              📅 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Main calendar + slots */}
        <div className="booking-main">
          {/* Calendar */}
          <div className="calendar-section">
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Select a Date & Time</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Times shown in your local timezone
              </p>
            </div>

            <div className="calendar-header">
              <button
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
                id="prev-month-btn"
              >‹</button>
              <span className="calendar-month-label">{format(currentMonth, 'MMMM yyyy')}</span>
              <button
                className="calendar-nav-btn"
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                id="next-month-btn"
              >›</button>
            </div>

            <div className="calendar-grid">
              {WEEKDAYS.map(d => (
                <div className="calendar-day-label" key={d}>{d}</div>
              ))}
              {days.map((day, i) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isPastDay = isBefore(day, today);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDay = isToday(day);

                return (
                  <div
                    key={i}
                    className={[
                      'calendar-day',
                      !isCurrentMonth ? 'empty' : '',
                      isPastDay ? 'disabled' : 'available',
                      isSelected ? 'selected' : '',
                      isTodayDay && !isSelected ? 'today' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => {
                      if (isCurrentMonth && !isPastDay) setSelectedDate(day);
                    }}
                    id={isCurrentMonth ? `day-${format(day, 'yyyy-MM-dd')}` : undefined}
                    style={{ color: !isCurrentMonth ? 'transparent' : undefined }}
                    title={isCurrentMonth ? format(day, 'MMMM d') : ''}
                  >
                    {isCurrentMonth ? format(day, 'd') : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="time-section">
              <div className="time-section-title">
                {format(selectedDate, 'EEE, MMM d')}
              </div>
              {slotsLoading ? (
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : slots.filter(s => s.available).length === 0 ? (
                <div className="no-slots">No available slots for this day.</div>
              ) : (
                <div className="time-slots-list">
                  {slots.filter(s => s.available).map((slot, i) => {
                    const start = parseISO(slot.start.replace('Z', '+00:00'));
                    return (
                      <button
                        key={i}
                        className="time-slot-btn"
                        onClick={() => handleSelectTime(slot)}
                        id={`slot-${i}`}
                      >
                        {format(start, 'h:mm a')}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
