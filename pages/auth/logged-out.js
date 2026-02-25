import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoggedOut() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGradient}></div>
      
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <div style={styles.icon}>🔐</div>
        </div>
        
        <h1 style={styles.title}>You've been logged out</h1>
        <p style={styles.subtitle}>Your session has expired due to inactivity (5 minutes)</p>
        <p style={styles.message}>Untuk keamanan akun, kami secara otomatis logout setelah 5 menit tidak ada aktivitas.</p>
        
        <button 
          onClick={() => router.push('/auth/login')}
          style={styles.button}
        >
          Login Kembali
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#0a0e27',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2d1b4e 100%)',
    opacity: 0.5,
    pointerEvents: 'none'
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '40px 20px',
    animation: 'slideDown 0.6s ease-out'
  },
  iconContainer: {
    marginBottom: '30px'
  },
  icon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '10px',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '20px',
    letterSpacing: '0.3px'
  },
  message: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '30px',
    maxWidth: '400px',
    margin: '0 auto 30px'
  },
  button: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)'
    }
  }
};
