import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [licenseType, setLicenseType] = useState('permanent');
  const [newLicense, setNewLicense] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLicense = async () => {
    try {
      const res = await fetch('/api/licenses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: licenseType })
      });

      const data = await res.json();
      setNewLicense(data.license);
    } catch (err) {
      console.error('Error generating license:', err);
    }
  };

  const handleCopyKey = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const handleNavigateToGames = () => {
    router.push('/games');
  };

  const handleExportData = () => {
    const data = {
      stats,
      exportedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saweria-backup-${Date.now()}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="dashboard">
      <div style={styles.content}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎮</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats?.totalGames || 0}</div>
              <div style={styles.statLabel}>Total Game</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                Rp {((stats?.totalAmount || 0) / 1000).toLocaleString('id-ID')}K
              </div>
              <div style={styles.statLabel}>Total Donasi</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎁</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats?.totalDonations || 0}</div>
              <div style={styles.statLabel}>Jumlah Donatur</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>📈</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>
                Rp {((stats?.averageDonation || 0) / 1000).toLocaleString('id-ID')}K
              </div>
              <div style={styles.statLabel}>Rata-rata Donasi</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionBar}>
          <button
            onClick={() => setShowGenerateModal(true)}
            style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
          >
            ✨ Generate License Baru
          </button>
          <button
            onClick={() => router.push('/games')}
            style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            ➕ Add Game
          </button>
          <button
            onClick={handleExportData}
            style={{ ...styles.actionBtn, background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}
          >
            📥 Backup Data
          </button>
        </div>

        {/* Games Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🎮 Game yang Terdaftar</h2>
          <div style={styles.gamesGrid}>
            {stats?.games && stats.games.length > 0 ? (
              stats.games.map((game) => (
                <div key={game.id} style={styles.gameCard}>
                  <div style={styles.gameName}>{game.name}</div>
                  <div style={styles.gameStats}>
                    <div style={styles.gameStat}>
                      <span style={styles.gameStatLabel}>Donasi</span>
                      <span style={styles.gameStatValue}>{game.donationCount}</span>
                    </div>
                    <div style={styles.gameStat}>
                      <span style={styles.gameStatLabel}>Total</span>
                      <span style={styles.gameStatValue}>
                        Rp {(game.donationAmount / 1000).toLocaleString('id-ID')}K
                      </span>
                    </div>
                  </div>
                  <button
                    style={styles.copyGameBtn}
                    onClick={() => handleCopyKey(game.name)}
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <p>Belum ada game terdaftar</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💳 Donasi Terbaru</h2>
          <div style={styles.donationsTable}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Game</th>
                  <th style={styles.tableHeader}>Donatur</th>
                  <th style={styles.tableHeader}>Jumlah</th>
                  <th style={styles.tableHeader}>Platform</th>
                  <th style={styles.tableHeader}>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentDonations && stats.recentDonations.length > 0 ? (
                  stats.recentDonations.map((donation) => (
                    <tr key={donation.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>{donation.game}</td>
                      <td style={styles.tableCell}>{donation.donor}</td>
                      <td style={{ ...styles.tableCell, color: '#10b981', fontWeight: '600' }}>
                        Rp {donation.amount.toLocaleString('id-ID')}
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.platformBadge}>{donation.platform}</span>
                      </td>
                      <td style={styles.tableCell}>
                        {new Date(donation.timestamp).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ ...styles.tableCell, textAlign: 'center', color: '#666' }}>
                      Belum ada donasi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate License Modal */}
      {showGenerateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowGenerateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✨ Generate License Baru</h2>
              <button
                style={styles.closeBtn}
                onClick={() => {
                  setShowGenerateModal(false);
                  setNewLicense(null);
                }}
              >
                ✕
              </button>
            </div>

            {!newLicense ? (
              <div style={styles.modalContent}>
                <div style={styles.modalSection}>
                  <label style={styles.modalLabel}>Jenis License</label>
                  <div style={styles.licenseTypeGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        value="permanent"
                        checked={licenseType === 'permanent'}
                        onChange={(e) => setLicenseType(e.target.value)}
                        style={styles.radio}
                      />
                      <span>🔓 Permanent (Selamanya)</span>
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        value="trial"
                        checked={licenseType === 'trial'}
                        onChange={(e) => setLicenseType(e.target.value)}
                        style={styles.radio}
                      />
                      <span>⏱️ Trial (10 Hari)</span>
                    </label>
                  </div>
                </div>

                <div style={styles.modalInfo}>
                  <p style={styles.infoText}>
                    {licenseType === 'permanent'
                      ? '✓ License berlaku selamanya tanpa batasan waktu.'
                      : '⏱️ License akan expire dalam 10 hari setelah dibuat.'}
                  </p>
                </div>

                <div style={styles.modalActions}>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    style={{ ...styles.modalBtn, background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleGenerateLicense}
                    style={{ ...styles.modalBtn, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff' }}
                  >
                    Generate License
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.modalContent}>
                <div style={styles.successBox}>
                  <div style={styles.successIcon}>✓</div>
                  <h3 style={styles.successTitle}>License Berhasil Dibuat!</h3>
                  <p style={styles.successSubtitle}>Salin data license berikut untuk diberikan kepada customer</p>
                </div>

                <div style={styles.licenseBox}>
                  <div style={styles.licenseField}>
                    <label style={styles.fieldLabel}>License ID</label>
                    <div style={styles.fieldValueContainer}>
                      <code style={styles.fieldValue}>{newLicense.id}</code>
                      <button
                        onClick={() => handleCopyKey(newLicense.id)}
                        style={styles.copyBtn}
                      >
                        {copied ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.licenseField}>
                    <label style={styles.fieldLabel}>Secret Key</label>
                    <div style={styles.fieldValueContainer}>
                      <code style={styles.fieldValue}>{newLicense.secretKey}</code>
                      <button
                        onClick={() => handleCopyKey(newLicense.secretKey)}
                        style={styles.copyBtn}
                      >
                        {copied ? '✓' : '📋'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.licenseField}>
                    <label style={styles.fieldLabel}>Tipe</label>
                    <div style={styles.fieldValue}>{newLicense.type === 'permanent' ? '🔓 Permanent' : '⏱️ Trial (10 hari)'}</div>
                  </div>

                  {newLicense.expiresAt && (
                    <div style={styles.licenseField}>
                      <label style={styles.fieldLabel}>Expire Date</label>
                      <div style={styles.fieldValue}>
                        {new Date(newLicense.expiresAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  )}
                </div>

                <div style={styles.warningBox}>
                  <p style={styles.warningText}>
                    ⚠️ <strong>Simpan secret key dengan aman!</strong> Jangan bagikan secret key kepada orang lain. Setiap license hanya bisa digunakan oleh satu customer.
                  </p>
                </div>

                <div style={styles.modalActions}>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setNewLicense(null);
                    }}
                    style={{ ...styles.modalBtn, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: '#fff', width: '100%' }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
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
  logoutBtn: {
    padding: '10px 24px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    fontSize: '40px'
  },
  statInfo: {
    flex: 1
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  statLabel: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#fff'
  },
  gamesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px'
  },
  gameCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  gameName: {
    fontSize: '16px',
    fontWeight: '700'
  },
  gameStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  gameStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '8px'
  },
  gameStatLabel: {
    fontSize: '12px',
    color: '#94a3b8'
  },
  gameStatValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6366f1'
  },
  copyGameBtn: {
    padding: '8px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#6366f1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666'
  },
  donationsTable: {
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
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    transition: 'background 0.2s ease'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px'
  },
  platformBadge: {
    padding: '4px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#6366f1',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer'
  },
  modalContent: {
    padding: '24px'
  },
  modalSection: {
    marginBottom: '24px'
  },
  modalLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#cbd5e1'
  },
  licenseTypeGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.6)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  radio: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  modalInfo: {
    padding: '12px 16px',
    background: 'rgba(99, 102, 241, 0.1)',
    borderLeft: '3px solid #6366f1',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  infoText: {
    fontSize: '13px',
    color: '#cbd5e1',
    margin: 0
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  modalBtn: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  successBox: {
    textAlign: 'center',
    marginBottom: '24px',
    padding: '24px'
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  successSubtitle: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  licenseBox: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  licenseField: {
    marginBottom: '16px'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: '8px'
  },
  fieldValueContainer: {
    display: 'flex',
    gap: '8px'
  },
  fieldValue: {
    flex: 1,
    padding: '10px 12px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '6px',
    color: '#6366f1',
    fontSize: '12px',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  copyBtn: {
    padding: '10px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#6366f1',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  warningBox: {
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  warningText: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: 0,
    lineHeight: '1.5'
  }
};
