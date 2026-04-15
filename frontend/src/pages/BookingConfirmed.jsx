import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

export default function BookingConfirmed() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { booking, eventType } = state || {};

  if (!booking) {
    navigate(`/book/${slug}`);
    return null;
  }

  const startTime = parseISO(booking.start_time.replace('Z', '+00:00'));
  const endTime = parseISO(booking.end_time.replace('Z', '+00:00'));

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

      <div className="confirmation-card">
        {/* Success icon */}
        <div className="confirmation-icon">✓</div>

        <h1 className="confirmation-title">You're scheduled!</h1>
        <p className="confirmation-subtitle">
          A confirmation has been sent to {booking.invitee_email}
        </p>

        {/* Details */}
        <div className="confirmation-details">
          <div className="confirmation-detail-row">
            <div className="confirmation-detail-icon">📋</div>
            <div>
              <div className="confirmation-detail-label">Event</div>
              <div className="confirmation-detail-value">{eventType?.name || booking.event_type?.name}</div>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <div className="confirmation-detail-icon">🗓️</div>
            <div>
              <div className="confirmation-detail-label">Date</div>
              <div className="confirmation-detail-value">{format(startTime, 'EEEE, MMMM d, yyyy')}</div>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <div className="confirmation-detail-icon">⏰</div>
            <div>
              <div className="confirmation-detail-label">Time</div>
              <div className="confirmation-detail-value">
                {format(startTime, 'h:mm a')} – {format(endTime, 'h:mm a')}
              </div>
            </div>
          </div>

          {(eventType?.location || booking.event_type?.location) && (
            <div className="confirmation-detail-row">
              <div className="confirmation-detail-icon">📍</div>
              <div>
                <div className="confirmation-detail-label">Location</div>
                <div className="confirmation-detail-value">
                  {eventType?.location || booking.event_type?.location}
                </div>
              </div>
            </div>
          )}

          <div className="confirmation-detail-row">
            <div className="confirmation-detail-icon">👤</div>
            <div>
              <div className="confirmation-detail-label">Invitee</div>
              <div className="confirmation-detail-value">{booking.invitee_name}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => navigate(`/book/${slug}`)}
            id="book-again-btn"
          >
            Book Another Meeting
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            id="print-btn"
          >
            🖨 Print / Save
          </button>
        </div>
      </div>
    </div>
  );
}
