import { useState } from 'react';
import { createEventType, updateEventType } from '../api';
import { toast } from './Toast';

const COLORS = ['#006BFF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const LOCATIONS = ['Google Meet', 'Zoom', 'Microsoft Teams', 'Phone Call', 'In Person', 'Custom'];

export default function EventTypeForm({ initialData, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    duration: initialData?.duration || 30,
    description: initialData?.description || '',
    color: initialData?.color || '#006BFF',
    location: initialData?.location || 'Google Meet',
    is_active: initialData?.is_active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({
      ...f,
      name,
      slug: initialData ? f.slug : slugify(name),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.slug.trim()) errs.slug = 'Slug is required';
    if (form.duration < 5) errs.duration = 'Duration must be at least 5 minutes';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (initialData) {
        await updateEventType(initialData.id, form);
        toast('Event type updated!');
      } else {
        await createEventType(form);
        toast('Event type created!');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Name */}
      <div className="form-group">
        <label className="form-label">Event Name</label>
        <input
          className="form-input"
          placeholder="e.g. 30 Minute Meeting"
          value={form.name}
          onChange={handleNameChange}
          id="et-name-input"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      {/* Slug */}
      <div className="form-group">
        <label className="form-label">URL Slug</label>
        <div className="input-with-prefix">
          <span className="input-prefix">/book/</span>
          <input
            placeholder="30min"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
            id="et-slug-input"
          />
        </div>
        {errors.slug && <div className="form-error">{errors.slug}</div>}
        <div className="form-hint">This will be your public booking URL</div>
      </div>

      {/* Duration */}
      <div className="form-group">
        <label className="form-label">Duration</label>
        <select
          className="form-select"
          value={form.duration}
          onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
          id="et-duration-select"
        >
          {DURATIONS.map(d => (
            <option key={d} value={d}>{d} minutes</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="form-group">
        <label className="form-label">Location</label>
        <select
          className="form-select"
          value={form.location}
          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          id="et-location-select"
        >
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description <span>(optional)</span></label>
        <textarea
          className="form-textarea"
          placeholder="Add a brief description of this event..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          id="et-desc-input"
        />
      </div>

      {/* Color */}
      <div className="form-group">
        <label className="form-label">Color</label>
        <div className="color-picker-row">
          {COLORS.map(c => (
            <div
              key={c}
              className={`color-swatch${form.color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setForm(f => ({ ...f, color: c }))}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading} id="et-save-btn">
          {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Event Type'}
        </button>
      </div>
    </form>
  );
}
