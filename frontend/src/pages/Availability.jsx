import { useState, useEffect } from 'react';
import { getAvailability, updateAvailability } from '../api';
import { toast } from '../components/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const defaultSchedule = () =>
  DAYS.map((_, i) => ({
    day_of_week: i,
    start_time: '09:00:00',
    end_time: '17:00:00',
    is_active: i < 5,
    timezone: 'Asia/Kolkata',
  }));

export default function Availability() {
  const [schedule, setSchedule] = useState(defaultSchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  useEffect(() => {
    getAvailability()
      .then(res => {
        if (res.data && res.data.length > 0) {
          const avail = res.data;
          const tz = avail[0]?.timezone || 'Asia/Kolkata';
          setTimezone(tz);

          const newSched = defaultSchedule();
          avail.forEach(a => {
            newSched[a.day_of_week] = {
              day_of_week: a.day_of_week,
              start_time: a.start_time,
              end_time: a.end_time,
              is_active: a.is_active,
              timezone: a.timezone,
            };
          });
          setSchedule(newSched);
        }
      })
      .catch(() => toast('Failed to load availability', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (i) => {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, is_active: !d.is_active } : d));
  };

  const setTime = (i, field, value) => {
    setSchedule(s => s.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = schedule.map(d => ({ ...d, timezone }));
      await updateAvailability(payload);
      toast('Availability saved!');
    } catch (e) {
      toast('Failed to save availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container page-enter">
      <div className="page-header">
        <div>
          <h1 className="page-title">Availability</h1>
          <p className="page-subtitle">Set your weekly availability and timezone.</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} id="save-availability-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Timezone */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="timezone-section" style={{ border: 'none', borderRadius: 0, margin: 0 }}>
          <span className="timezone-icon">🌍</span>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>TIMEZONE</div>
            <select
              className="timezone-select"
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              id="timezone-select"
            >
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Weekly Hours</h3>
        </div>
        <div className="availability-grid">
          {DAYS.map((day, i) => (
            <div className="availability-row" key={day}>
              {/* Toggle + Day name */}
              <div className="day-toggle">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={schedule[i].is_active}
                    onChange={() => toggle(i)}
                    id={`toggle-${day.toLowerCase()}`}
                  />
                  <span className="toggle-slider" />
                </label>
                <span className="day-name" style={{ color: schedule[i].is_active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {day}
                </span>
              </div>

              {/* Time Range */}
              {schedule[i].is_active ? (
                <div className="time-range">
                  <input
                    type="time"
                    className="time-range-input"
                    value={schedule[i].start_time.slice(0, 5)}
                    onChange={e => setTime(i, 'start_time', e.target.value + ':00')}
                    id={`start-${day.toLowerCase()}`}
                  />
                  <span className="time-range-sep">–</span>
                  <input
                    type="time"
                    className="time-range-input"
                    value={schedule[i].end_time.slice(0, 5)}
                    onChange={e => setTime(i, 'end_time', e.target.value + ':00')}
                    id={`end-${day.toLowerCase()}`}
                  />
                </div>
              ) : (
                <div style={{ flex: 1, fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Unavailable
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
