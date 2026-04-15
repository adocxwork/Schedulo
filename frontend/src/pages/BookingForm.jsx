import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { createBooking } from '../api';
import { toast } from '../components/Toast';

export default function BookingForm() {
  const { slug } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const { slot, eventType } = state || {};

  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!slot || !eventType) {
    navigate(`/book/${slug}`);
    return null;
  }

  const startTime = parseISO(slot.start.replace('Z', '+00:00'));
  const endTime = parseISO(slot.end.replace('Z', '+00:00'));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await createBooking({
        event_type_id: eventType.id,
        invitee_name: form.name,
        invitee_email: form.email,
        start_time: slot.start,
        notes: form.notes || undefined,
      });
      navigate(`/book/${slug}/confirmed`, { state: { booking: res.data, eventType } });
    } catch (err) {
      const msg = err.response?.data?.detail || 'This slot is no longer available.';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

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

      <div className="booking-form-card">
        {/* Side info */}
        <div className="booking-form-side">
          <div style={{
            width: 40, height: 40, borderRadius: 50,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#fff'
          }}>A</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Aditya Gupta</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {eventType.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>🗓️</span>
              <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>⏰</span>
              <span>{format(startTime, 'h:mm a')} – {format(endTime, 'h:mm a')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>⏱</span>
              <span>{eventType.duration} min</span>
            </div>
            {eventType.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <span>📍</span>
                <span>{eventType.location}</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginTop: 'auto' }}
            id="back-btn"
          >
            ← Go back
          </button>
        </div>

        {/* Form */}
        <div className="booking-form-main">
          <h2 className="booking-form-title">Enter your details</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors({}); }}
                id="invitee-name-input"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors({}); }}
                id="invitee-email-input"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes <span>(optional)</span></label>
              <textarea
                className="form-textarea"
                placeholder="Anything you'd like to share before the meeting..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                id="invitee-notes-input"
              />
            </div>

            <div style={{ margin: '16px 0', padding: '12px 16px', background: 'var(--border-light)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              By scheduling, you agree that your name and email will be shared with the host.
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loading}
              id="confirm-booking-btn"
            >
              {loading ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
