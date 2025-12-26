import { NavLink } from 'react-router-dom';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import '../layouts/Header.css';

export const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      (window as any).showAlert?.('Logged out successfully', 'success');
    }
  };

  const getUserInitials = (email: string) => {
    const parts = email.split('@');
    if (parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">☁️📸</span>
        <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>CloudPix</span>
        </NavLink>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Upload
        </NavLink>
        <NavLink to="/files" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          My Files
        </NavLink>
        <NavLink to="/shared" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Shared
        </NavLink>
      </nav>

      <div className="user-menu">
        {user && (
          <>
            <div className="user-info">
              <div className="user-email">{user.email}</div>
            </div>
            <div className="user-avatar">
              {getUserInitials(user.email)}
            </div>
          </>
        )}
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

