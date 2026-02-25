import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #0a0e27;
        color: #fff;
        scroll-behavior: smooth;
      }
      
      body::-webkit-scrollbar {
        width: 10px;
      }
      
      body::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.3);
      }
      
      body::-webkit-scrollbar-thumb {
        background: rgba(99, 102, 241, 0.5);
        border-radius: 5px;
      }
    `;
    document.head.appendChild(style);

    // Check auth on route change
    const handleRouteChange = (url) => {
      const publicPages = ['/auth/login', '/auth/logged-out', '/api/*'];
      const isPublicPage = publicPages.some(p => {
        if (p === '/api/*') return url.startsWith('/api/');
        return url === p;
      });

      if (!isPublicPage && url !== '/') {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [router]);

  // Session timeout logic
  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicPages = ['/auth/login', '/auth/logged-out', '/'];
    const isPublicPage = publicPages.includes(router.pathname);

    if (!token || isPublicPage) return;

    const resetTimeout = () => {
      lastActivityRef.current = Date.now();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/logged-out');
      }, SESSION_TIMEOUT);
    };

    const handleActivity = () => {
      resetTimeout();
    };

    // Setup activity listeners
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    resetTimeout();

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router]);

  return <Component {...pageProps} />;
}

export default MyApp;
