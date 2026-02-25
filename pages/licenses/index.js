import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LicensesPage() {
  const router = useRouter();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/licenses/list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      setLicenses(data.licenses);
    } catch (err) {
      console.error('Error fetching licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.pageTitle}>🔑 Daftar License</h1>
            <p style={styles.pageSubtitle}>Kelola semua license yang telah dibuat</p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={() => router.push('/dashboard')} style={{ ...styles.actionBtn, marginRight: '10px' }}>
              ← Kembali
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total License</span>
            <span style={styles.statValue}>{licenses.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>License Aktif</span>
            <span style={styles.statValue}>{licenses.filter(l => l.isValid).length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Trial</span>
            <span style={styles.statValue}>{licenses.filter(l => l.type === 'trial').length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Permanent</span>
            <span style={styles.statValue}>{licenses.filter(l => l.type === 'permanent').length}</span>
          </div>
        </div>

        <div style={styles.licensesTable}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.tableHeader}>License ID</th>
                <th style={styles.tableHeader}>Tipe</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Dibuat</th>
                <th style={styles.tableHeader}>Expires</th>
                <th style={styles.tableHeader}>Action</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length > 0 ? (
                licenses.map((license) => (
                  <tr key={license.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <code style={styles.licenseCode}>{license.id}</code>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        background: license.type === 'permanent' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: license.type === 'permanent' ? '#86efac' : '#fcd34d'
                      }}>
                        {license.type === 'permanent' ? '🔓 Permanent' : '⏱️ Trial'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.badge,
                        background: license.isValid ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: license.isValid ? '#86efac' : '#fca5a5'
                      }}>
                        {license.isValid ? '✓ Aktif' : '✕ Inactive'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {new Date(license.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td style={styles.tableCell}>
                      {license.expiresAt
                        ? `${new Date(license.expiresAt).toLocaleDateString('id-ID')} (${license.daysLeft} hari)`
                        : '∞'
                      }
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(license.id);
                          alert('License ID copied!');
                        }}
                        style={styles.copyBtn}
                      >
                        Copy ID
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.tableCell, textAlign: 'center', color: '#666' }}>
                    Belum ada license
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    color: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: '40px'
  },
  header: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    padding: '30px 40px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    fontWeight: '400'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  actionBtn: {
    padding: '10px 24px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#6366f1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  logoutBtn: {
    padding: '10px 24px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '30px'
  },
  statItem: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700'
  },
  licensesTable: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
  },
  tableHeader: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px'
  },
  licenseCode: {
    padding: '4px 8px',
    background: 'rgba(99, 102, 241, 0.1)',
    color: '#6366f1',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  copyBtn: {
    padding: '6px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#6366f1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  }
};
