import { useState, useEffect } from 'react';
import { getBookings, cancelBooking } from '../api';
import { format, isPast, parseISO } from 'date-fns';
import Modal from '../components/Modal';
import { toast } from '../components/Toast';

export default function Meetings() {
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBookings(tab);
      setBookings(res.data);
    } catch (e) {
      toast('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id, cancelReason);
      toast('Meeting cancelled');
      setCancelTarget(null);
      setCancelReason('');
      load();
    } catch (e) {
      toast('Failed to cancel meeting', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dt) => {
    try { return format(parseISO(dt.replace('Z', '+00:00')), 'EEE, MMM d, yyyy'); }
    catch { return dt; }
  };
  const formatTime = (dt) => {
    try { return format(parseISO(dt.replace('Z', '+00:00')), 'h:mm a'); }
    catch { return dt; }
  };

  const getMeetingStatus = (booking) => {
    if (booking.status === 'cancelled') return 'cancelled';
    if (isPast(parseISO(booking.end_time.replace('Z', '+00:00')))) return 'past';
    return 'scheduled';
  };

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Meetings</h1>
          <p className="page-subtitle">View and manage all scheduled meetings.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="meetings-tabs">
        <button
          className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`}
          onClick={() => setTab('upcoming')}
          id="tab-upcoming"
        >Upcoming</button>
        <button
          className={`tab-btn${tab === 'past' ? ' active' : ''}`}
          onClick={() => setTab('past')}
          id="tab-past"
        >Past</button>
      </div>

      {/* List */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'upcoming' ? '📅' : '📁'}</div>
          <h3 className="empty-title">
            {tab === 'upcoming' ? 'No upcoming meetings' : 'No past meetings'}
          </h3>
          <p className="empty-desc">
            {tab === 'upcoming'
              ? 'Share your event links to start receiving bookings.'
              : 'Your completed meetings will appear here.'}
          </p>
        </div>
      ) : (
        <div className="meetings-list">
          {bookings.map(b => {
            const status = getMeetingStatus(b);
            return (
              <div className="meeting-card" key={b.id} id={`meeting-${b.id}`}>
                <div className="meeting-color-bar" style={{ background: b.event_type?.color || '#006BFF' }} />
                <div className="meeting-date-block">
                  <div className="meeting-date-day">{formatDate(b.start_time).split(', ')[1]?.split(' ')[1]}</div>
                  <div className="meeting-date-month">{formatDate(b.start_time).split(' ')[1]}</div>
                </div>
                <div className="meeting-info">
                  <div className="meeting-title">{b.event_type?.name || 'Meeting'}</div>
                  <div className="meeting-invitee">with {b.invitee_name} · {b.invitee_email}</div>
                  <div className="meeting-time">
                    {formatDate(b.start_time)} &nbsp;·&nbsp; {formatTime(b.start_time)} – {formatTime(b.end_time)}
                    {b.event_type?.location && <span> &nbsp;·&nbsp; {b.event_type.location}</span>}
                  </div>
                  {b.notes && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Note: {b.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`meeting-status-badge ${status}`}>
                    {status === 'scheduled' ? 'Upcoming' : status === 'past' ? 'Completed' : 'Cancelled'}
                  </span>
                  {status === 'scheduled' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { setCancelTarget(b); setCancelReason(''); }}
                      id={`cancel-btn-${b.id}`}
                    >
                      Cancel
                    </button>
                  )}
                  {b.cancellation_reason && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 160, textAlign: 'right' }}>
                      Reason: {b.cancellation_reason}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Meeting"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCancelTarget(null)}>Keep Meeting</button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Meeting'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Are you sure you want to cancel the meeting with <strong>{cancelTarget?.invitee_name}</strong>?
        </p>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Reason <span>(optional)</span></label>
          <textarea
            className="form-textarea"
            placeholder="Add a reason for cancellation..."
            value={cancelReason}
            onChange={e => setCancelReason(e.target.value)}
            id="cancel-reason-input"
          />
        </div>
      </Modal>
    </div>
  );
}
