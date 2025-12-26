import { NavLink } from 'react-router-dom';
import { Button } from './Button';
import '../layouts/Header.css';

export const Header = () => {
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      (window as any).showAlert?.('Logged out successfully', 'success');
      // In a real app, you would clear tokens and redirect to login
      setTimeout(() => {
        alert('In a real app, this would redirect to login page');
      }, 1000);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">☁️📸</span>
        <span>CloudPix</span>
      </div>

      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
        <div className="user-avatar">AJ</div>
        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};

