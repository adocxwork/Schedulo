import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

// ── Event Types ──────────────────────────────────────────────────────────────
export const getEventTypes = () => api.get('/api/event-types');
export const getAllEventTypes = () => api.get('/api/event-types/all');
export const getEventTypeBySlug = (slug) => api.get(`/api/event-types/${slug}`);
export const createEventType = (data) => api.post('/api/event-types', data);
export const updateEventType = (id, data) => api.put(`/api/event-types/${id}`, data);
export const deleteEventType = (id) => api.delete(`/api/event-types/${id}`);

// ── Availability ─────────────────────────────────────────────────────────────
export const getAvailability = () => api.get('/api/availability');
export const updateAvailability = (schedules) => api.put('/api/availability', { schedules });

// ── Bookings ─────────────────────────────────────────────────────────────────
export const getBookings = (status) => api.get('/api/bookings', { params: status ? { status } : {} });
export const getBooking = (id) => api.get(`/api/bookings/${id}`);
export const getAvailableSlots = (eventTypeId, date) =>
  api.get('/api/bookings/available-slots', { params: { event_type_id: eventTypeId, date } });
export const createBooking = (data) => api.post('/api/bookings', data);
export const cancelBooking = (id, reason) => api.put(`/api/bookings/${id}/cancel`, { cancellation_reason: reason });
