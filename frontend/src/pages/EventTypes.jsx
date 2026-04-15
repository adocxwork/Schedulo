import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEventTypes, deleteEventType } from '../api';
import Modal from '../components/Modal';
import EventTypeForm from '../components/EventTypeForm';
import { toast } from '../components/Toast';

export default function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingET, setEditingET] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await getEventTypes();
      setEventTypes(res.data);
    } catch (e) {
      toast('Failed to load event types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (et, e) => { e.stopPropagation(); setEditingET(et); setShowModal(true); };
  const handleNew = () => { setEditingET(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditingET(null); };
  const handleSaved = () => { handleClose(); load(); };

  const handleDelete = async (id) => {
    try {
      await deleteEventType(id);
      toast('Event type deleted');
      setDeleteConfirm(null);
      load();
    } catch (e) {
      toast('Failed to delete', 'error');
    }
  };

  const copyLink = (slug, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
    toast('Link copied to clipboard!');
  };

  return (
    <div className="page-container page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Types</h1>
          <p className="page-subtitle">Create events that show on your scheduling page.</p>
        </div>
        <button className="btn btn-primary" onClick={handleNew} id="new-event-type-btn">
          + New Event Type
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : eventTypes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h3 className="empty-title">No event types yet</h3>
          <p className="empty-desc">Create your first event type to start accepting bookings.</p>
          <button className="btn btn-primary" onClick={handleNew}>+ Create Event Type</button>
        </div>
      ) : (
        <div className="event-types-grid">
          {eventTypes.map(et => (
            <div
              key={et.id}
              className="event-type-card"
              onClick={() => navigate(`/book/${et.slug}`)}
              id={`event-type-card-${et.id}`}
            >
              <div className="event-type-card-accent" style={{ background: et.color }} />
              <div className="event-type-card-body">
                <div className="event-type-card-header">
                  <div>
                    <div className="event-type-name">{et.name}</div>
                    <div className="event-type-duration">
                      <span>⏱</span> {et.duration} min
                      {et.location && <span style={{ marginLeft: 8 }}>·</span>}
                      {et.location && <span>{et.location}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="status-dot active" title="Active" />
                  </div>
                </div>
                {et.description && (
                  <p className="event-type-desc">{et.description}</p>
                )}
                <div className="copy-link-box" onClick={e => e.stopPropagation()}>
                  <span className="copy-link-text">
                    {window.location.origin}/book/{et.slug}
                  </span>
                  <button className="copy-btn" onClick={(e) => copyLink(et.slug, e)}>Copy</button>
                </div>
              </div>
              <div className="event-type-card-footer">
                <span className="event-type-badge" style={{ color: et.color, background: et.color + '15' }}>
                  {et.duration} min
                </span>
                <div className="event-type-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => handleEdit(et, e)}
                    id={`edit-btn-${et.id}`}
                    title="Edit"
                  >✏️ Edit</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(et); }}
                    id={`delete-btn-${et.id}`}
                    title="Delete"
                  >🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleClose}
        title={editingET ? 'Edit Event Type' : 'New Event Type'}
      >
        <EventTypeForm
          initialData={editingET}
          onSaved={handleSaved}
          onCancel={handleClose}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Event Type"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm?.id)}>
              Delete
            </button>
          </>
        }
      >
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>"{deleteConfirm?.name}"</strong>? This will also
          delete all associated bookings. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
