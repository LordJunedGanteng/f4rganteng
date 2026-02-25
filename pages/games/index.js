import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';

export default function GamesManagement() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIntegrationSetup, setShowIntegrationSetup] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [newlyCreatedGame, setNewlyCreatedGame] = useState(null);
  const [copied, setCopied] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    robloxGameId: '',
    saweriaUsername: '',
    bagibaguUsername: '',
    isTemporary: false,
    duration: '7'
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/games/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'list' })
      });

      if (!res.ok) {
        router.push('/auth/login');
        return;
      }

      const data = await res.json();
      setGames(data.games);
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async () => {
    if (!formData.name || !formData.robloxGameId) {
      alert('Game name dan Roblox ID harus diisi');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/games/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'add',
          ...formData
        })
      });

      if (!res.ok) {
        alert('Gagal menambah game');
        return;
      }

      const data = await res.json();
      setGames([...games, data.game]);
      setNewlyCreatedGame(data.game);
      setShowAddModal(false);
      setShowIntegrationSetup(true);
      resetForm();
    } catch (err) {
      console.error('Error adding game:', err);
      alert('Terjadi kesalahan');
    }
  };

  const handleUpdateGame = async () => {
    if (!formData.name || !formData.robloxGameId) {
      alert('Game name dan Roblox ID harus diisi');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/games/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'update',
          gameId: editingGame.id,
          name: formData.name,
          robloxGameId: formData.robloxGameId,
          saweriaUsername: formData.saweriaUsername,
          bagibaguUsername: formData.bagibaguUsername
        })
      });

      if (!res.ok) {
        alert('Gagal update game');
        return;
      }

      const data = await res.json();
      setGames(games.map(g => g.id === editingGame.id ? data.game : g));
      setShowEditModal(false);
      setEditingGame(null);
      resetForm();
    } catch (err) {
      console.error('Error updating game:', err);
      alert('Terjadi kesalahan');
    }
  };

  const handleDeleteGame = async (gameId, gameName) => {
    if (!confirm(`Hapus game "${gameName}"? Semua data donasi untuk game ini juga akan dihapus.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/games/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'delete',
          gameId
        })
      });

      if (!res.ok) {
        alert('Gagal menghapus game');
        return;
      }

      setGames(games.filter(g => g.id !== gameId));
    } catch (err) {
      console.error('Error deleting game:', err);
      alert('Terjadi kesalahan');
    }
  };

  const handleEditClick = (game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      robloxGameId: game.robloxGameId,
      saweriaUsername: game.saweriaUsername || '',
      bagibaguUsername: game.bagibaguUsername || '',
      isTemporary: game.isTemporary || false,
      duration: '7'
    });
    setShowEditModal(true);
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      robloxGameId: '',
      saweriaUsername: '',
      bagibaguUsername: '',
      isTemporary: false,
      duration: '7'
    });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingSpinner}>
          <div style={styles.spinner}></div>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentPage="games">
      <div style={styles.content}>
        {/* Action Bar */}
        <div style={styles.actionBar}>
          <button
            onClick={handleAddClick}
            style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            ➕ Add Game
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ ...styles.actionBtn, background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}
          >
            📊 Back to Dashboard
          </button>
        </div>

        {/* Games Table */}
        <div style={styles.tableContainer}>
          {games.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Game Name</th>
                  <th style={styles.tableHeader}>Roblox ID</th>
                  <th style={styles.tableHeader}>Saweria Username</th>
                  <th style={styles.tableHeader}>BagiBagi Username</th>
                  <th style={styles.tableHeader}>Status</th>
                  <th style={styles.tableHeader}>Donations</th>
                  <th style={styles.tableHeader}>Total Amount</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <strong>{game.name}</strong>
                    </td>
                    <td style={styles.tableCell}>{game.robloxGameId}</td>
                    <td style={styles.tableCell}>{game.saweriaUsername || '-'}</td>
                    <td style={styles.tableCell}>{game.bagibaguUsername || '-'}</td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        background: game.isTemporary ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: game.isTemporary ? '#fca5a5' : '#6ee7b7'
                      }}>
                        {game.isTemporary ? '⏱️ Temporary' : '🔓 Permanent'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{game.donations || 0}</td>
                    <td style={styles.tableCell}>
                      <span style={{ color: '#10b981', fontWeight: '600' }}>
                        Rp {((game.totalAmount || 0) / 1000).toLocaleString('id-ID')}K
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleEditClick(game)}
                          style={styles.editBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id, game.name)}
                          style={styles.deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎮</div>
              <p style={styles.emptyText}>No games yet. Add your first game!</p>
              <button
                onClick={handleAddClick}
                style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', marginTop: '20px' }}
              >
                ➕ Add Game
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Game Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>➕ Add New Game</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <FormFields formData={formData} setFormData={setFormData} />
              
              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{ ...styles.modalBtn, background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGame}
                  style={{ ...styles.modalBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' }}
                >
                  Create Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✏️ Edit Game</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <FormFields formData={formData} setFormData={setFormData} isEdit={true} />
              
              <div style={styles.secretKeyBox}>
                <label style={styles.fieldLabel}>Secret Key (for Roblox Script)</label>
                <div style={styles.fieldValueContainer}>
                  <code style={styles.fieldValue}>{editingGame?.secretKey}</code>
                  <button
                    onClick={() => handleCopy(editingGame?.secretKey, 'secretKey')}
                    style={styles.copyBtn}
                  >
                    {copied === 'secretKey' ? '✓' : '📋'}
                  </button>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowEditModal(false)}
                  style={{ ...styles.modalBtn, background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGame}
                  style={{ ...styles.modalBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integration Setup Modal */}
      {showIntegrationSetup && newlyCreatedGame && (
        <div style={styles.modalOverlay} onClick={() => setShowIntegrationSetup(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✨ Selamat! Game Berhasil Ditambah</h2>
              <button
                style={styles.closeBtn}
                onClick={() => setShowIntegrationSetup(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.successBox}>
                <div style={styles.successIcon}>🎉</div>
                <h3 style={styles.successTitle}>Game: {newlyCreatedGame.name}</h3>
                <p style={styles.successSubtitle}>Setup integration dengan platform donation</p>
              </div>

              <div style={styles.integrationBox}>
                <div style={styles.integrationSection}>
                  <div style={styles.integrationHeader}>
                    <span style={styles.integrationIcon}>💳</span>
                    <span style={styles.integrationTitle}>Saweria Integration</span>
                  </div>
                  <p style={styles.integrationSubtext}>Copy URL berikut ke Saweria webhook settings:</p>
                  <div style={styles.urlBox}>
                    <code style={styles.urlCode}>
                      /api/donations?platform=saweria&secretKey={newlyCreatedGame.secretKey}
                    </code>
                    <button
                      onClick={() => handleCopy(`/api/donations?platform=saweria&secretKey=${newlyCreatedGame.secretKey}`, 'saweria')}
                      style={styles.copyBtn}
                    >
                      {copied === 'saweria' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.integrationSection}>
                  <div style={styles.integrationHeader}>
                    <span style={styles.integrationIcon}>💰</span>
                    <span style={styles.integrationTitle}>BagiBagi Integration</span>
                  </div>
                  <p style={styles.integrationSubtext}>Copy URL berikut ke BagiBagi webhook settings:</p>
                  <div style={styles.urlBox}>
                    <code style={styles.urlCode}>
                      /api/donations?platform=bagibagi&secretKey={newlyCreatedGame.secretKey}
                    </code>
                    <button
                      onClick={() => handleCopy(`/api/donations?platform=bagibagi&secretKey=${newlyCreatedGame.secretKey}`, 'bagibagi')}
                      style={styles.copyBtn}
                    >
                      {copied === 'bagibagi' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  ℹ️ Paste URL di atas ke webhook settings masing-masing platform (Saweria & BagiBagi) untuk menerima notifikasi donasi secara real-time.
                </p>
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowIntegrationSetup(false)}
                  style={{ ...styles.modalBtn, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff', width: '100%' }}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function FormFields({ formData, setFormData, isEdit = false }) {
  return (
    <>
      <div style={styles.formGroup}>
        <label style={styles.fieldLabel}>Game Name *</label>
        <input
          type="text"
          placeholder="e.g., My Awesome Game"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.fieldLabel}>Roblox Game ID *</label>
        <input
          type="number"
          placeholder="e.g., 9258273735"
          value={formData.robloxGameId}
          onChange={(e) => setFormData({ ...formData, robloxGameId: e.target.value })}
          style={styles.input}
        />
      </div>

      <div style={styles.twoColumns}>
        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>Saweria Username</label>
          <input
            type="text"
            placeholder="e.g., username"
            value={formData.saweriaUsername}
            onChange={(e) => setFormData({ ...formData, saweriaUsername: e.target.value })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.fieldLabel}>BagiBagi Username</label>
          <input
            type="text"
            placeholder="e.g., username"
            value={formData.bagibaguUsername}
            onChange={(e) => setFormData({ ...formData, bagibaguUsername: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>

      {!isEdit && (
        <>
          <div style={styles.formGroup}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.isTemporary}
                onChange={(e) => setFormData({ ...formData, isTemporary: e.target.checked })}
                style={styles.checkbox}
              />
              <span>Temporary Game (Auto-delete after expiration)</span>
            </label>
          </div>

          {formData.isTemporary && (
            <div style={styles.formGroup}>
              <label style={styles.fieldLabel}>Duration (Days)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                style={styles.input}
                min="1"
              />
            </div>
          )}
        </>
      )}
    </>
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
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
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
  actionBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  actionBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    color: '#fff'
  },
  tableContainer: {
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
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
    transition: 'background 0.2s ease'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block'
  },
  actionButtons: {
    display: 'flex',
    gap: '8px'
  },
  editBtn: {
    padding: '6px 12px',
    background: 'rgba(59, 130, 246, 0.2)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    color: '#60a5fa',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  deleteBtn: {
    padding: '6px 12px',
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    color: '#94a3b8'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  emptyText: {
    fontSize: '16px',
    marginBottom: '20px'
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
  formGroup: {
    marginBottom: '20px'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '8px',
    color: '#cbd5e1'
  },
  input: {
    width: '100%',
    padding: '12px',
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease'
  },
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  secretKeyBox: {
    padding: '16px',
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    marginBottom: '20px'
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
    color: '#60a5fa',
    fontSize: '12px',
    fontFamily: 'monospace',
    wordBreak: 'break-all'
  },
  copyBtn: {
    padding: '10px 12px',
    background: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: '#60a5fa',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px'
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
  integrationBox: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  },
  integrationSection: {
    marginBottom: '20px'
  },
  integrationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  integrationIcon: {
    fontSize: '20px'
  },
  integrationTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff'
  },
  integrationSubtext: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '12px',
    margin: 0
  },
  urlBox: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px'
  },
  urlCode: {
    flex: 1,
    fontSize: '11px',
    color: '#60a5fa',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    margin: 0
  },
  divider: {
    height: '1px',
    background: 'rgba(148, 163, 184, 0.2)',
    margin: '20px 0'
  },
  infoBox: {
    padding: '12px 16px',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  infoText: {
    fontSize: '12px',
    color: '#cbd5e1',
    margin: 0,
    lineHeight: '1.5'
  }
};
