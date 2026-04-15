import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/event-types', icon: '⚡', label: 'Event Types' },
  { to: '/availability', icon: '🗓️', label: 'Availability' },
  { to: '/meetings', icon: '📋', label: 'Meetings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <NavLink to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <div className="logo-icon">S</div>
        <span className="logo-text">Schedulo</span>
      </NavLink>

      {/* User info */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">A</div>
        <div className="sidebar-user-info">
          <div className="name">Aditya Gupta</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
