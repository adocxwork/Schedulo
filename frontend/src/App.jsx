import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import Dashboard from './pages/Dashboard';
import EventTypes from './pages/EventTypes';
import Availability from './pages/Availability';
import Meetings from './pages/Meetings';
import BookingPage from './pages/BookingPage';
import BookingForm from './pages/BookingForm';
import BookingConfirmed from './pages/BookingConfirmed';
import './index.css';

// Layout for admin pages (with sidebar)
function AdminLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Admin routes (with sidebar) */}
        <Route path="/" element={
          <AdminLayout><Dashboard /></AdminLayout>
        } />
        <Route path="/event-types" element={
          <AdminLayout><EventTypes /></AdminLayout>
        } />
        <Route path="/availability" element={
          <AdminLayout><Availability /></AdminLayout>
        } />
        <Route path="/meetings" element={
          <AdminLayout><Meetings /></AdminLayout>
        } />

        {/* Public booking routes (no sidebar) */}
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/book/:slug/details" element={<BookingForm />} />
        <Route path="/book/:slug/confirmed" element={<BookingConfirmed />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
