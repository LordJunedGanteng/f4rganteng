export default function AdminLayout({ children, currentPage = 'dashboard' }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💳</div>
          <div style={styles.logoText}>
            <div style={styles.logoTitle}>Donation</div>
            <div style={styles.logoSubtitle}>Admin Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <a
            href="/dashboard"
            style={{
              ...styles.navItem,
              ...(currentPage === 'dashboard' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>📊</span>
            <span>Dashboard</span>
          </a>
          <a
            href="/games"
            style={{
              ...styles.navItem,
              ...(currentPage === 'games' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>🎮</span>
            <span>Games</span>
          </a>
          <a
            href="/database"
            style={{
              ...styles.navItem,
              ...(currentPage === 'database' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>📁</span>
            <span>Database</span>
          </a>
          <a
            href="/backups"
            style={{
              ...styles.navItem,
              ...(currentPage === 'backups' ? styles.navItemActive : {})
            }}
          >
            <span style={styles.navIcon}>💾</span>
            <span>Backups</span>
          </a>
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span style={styles.logoutIcon}>🚪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
  },
  sidebar: {
    width: '260px',
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderRight: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    overflowY: 'auto'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 24px',
    marginBottom: '40px',
    cursor: 'pointer'
  },
  logoIcon: {
    fontSize: '32px'
  },
  logoText: {
    flex: 1
  },
  logoTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  logoSubtitle: {
    fontSize: '11px',
    color: '#94a3b8'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    borderLeft: '3px solid transparent',
    cursor: 'pointer'
  },
  navItemActive: {
    color: '#60a5fa',
    background: 'rgba(59, 130, 246, 0.1)',
    borderLeftColor: '#60a5fa'
  },
  navIcon: {
    fontSize: '18px'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    margin: '0 16px',
    justifyContent: 'center'
  },
  logoutIcon: {
    fontSize: '16px'
  },
  main: {
    flex: 1,
    marginLeft: '260px',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'
  }
};
