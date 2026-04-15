import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventTypes, getBookings } from '../api';
import { format, parseISO, isPast } from 'date-fns';

export default function Dashboard() {
  const [eventTypes, setEventTypes] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getEventTypes().then(r => setEventTypes(r.data)),
      getBookings('upcoming').then(r => setUpcoming(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const formatTime = (dt) => {
    try { return format(parseISO(dt.replace('Z', '+00:00')), 'MMM d · h:mm a'); }
    catch { return dt; }
  };

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good day, Aditya! 👋</h1>
          <p className="page-subtitle">Here's what's happening with your schedule.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/event-types')}>
          + New Event Type
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EEF2FF' }}>⚡</div>
          <div>
            <div className="stat-value">{eventTypes.length}</div>
            <div className="stat-label">Event Types</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ECFDF5' }}>📅</div>
          <div>
            <div className="stat-value">{upcoming.length}</div>
            <div className="stat-label">Upcoming Meetings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF7ED' }}>🔗</div>
          <div>
            <div className="stat-value">{eventTypes.length}</div>
            <div className="stat-label">Active Links</div>
          </div>
        </div>
      </div>

      {/* Quick links to event types */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Event Types Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Event Types</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/event-types')}>View all →</button>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : eventTypes.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                No event types yet
              </div>
            ) : (
              eventTypes.slice(0, 4).map(et => (
                <div
                  key={et.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', cursor: 'pointer', transition: 'background var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--border-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/book/${et.slug}`)}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: et.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {et.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{et.duration} min</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>View →</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Meetings Preview */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Upcoming Meetings</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/meetings')}>View all →</button>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : upcoming.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                No upcoming meetings
              </div>
            ) : (
              upcoming.slice(0, 4).map(b => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 8,
                    background: b.event_type?.color + '20' || '#EEF2FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>📅</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.invitee_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {formatTime(b.start_time)} · {b.event_type?.name}
                    </div>
                  </div>
                  <span className="meeting-status-badge scheduled" style={{ fontSize: 10 }}>upcoming</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
