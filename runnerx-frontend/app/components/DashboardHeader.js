'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/app/dashboard/DashboardSidebar';

export default function DashboardHeader({ originConfig, user, logoutAction }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firstName = user?.name ? user.name.split(' ')[0] : 'Runner';

  const isActiveLink = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      height: '64px', display: 'flex', alignItems: 'center',
    }} className="dashboard-header">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Hamburger Menu (Mobile Only) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg-hidden"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', color: 'var(--text)',
            }}
            title="Open Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          {/* RunnerX Logo */}
          <Link href="/dashboard/registrations" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/runnerxlogo.png" 
              alt="RunnerX" 
              style={{ height: '32px', width: 'auto', display: 'block' }} 
              className="header-logo"
            />
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {originConfig && (
            <a href={originConfig.url} style={{
              fontSize: '0.75rem', color: '#64748b', fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'color 0.15s',
            }}
            className="header-back-link"
            >
              <span className="back-link-text">← Back to {originConfig.name}</span>
              <span className="back-link-icon">←</span>
            </a>
          )}

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '16px', borderLeft: '1px solid #e2e8f0' }}>
              <div className="header-user-info" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Hey, {firstName}</div>
              </div>
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: '#ffc83c', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(255,200,60,0.2)'
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
          {/* Overlay */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
          />
          
          {/* Drawer */}
          <div style={{ 
            position: 'absolute', top: 0, left: 0, bottom: 0, 
            width: '85%', maxWidth: '320px', background: 'white', 
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</h3>
              <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 16px', borderRadius: '10px',
                      textDecoration: 'none', fontSize: '0.95rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? 'var(--primary)' : 'var(--text)',
                      background: active ? 'rgba(255,200,60,0.08)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}

              <div style={{ height: '1px', background: '#e2e8f0', margin: '8px 0' }} />
              <form action={logoutAction}>
                <button
                  type="submit"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    width: '100%', textAlign: 'left',
                    fontSize: '0.95rem', color: '#ef4444', fontWeight: 500,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Logout
                </button>
              </form>
            </nav>

            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
              <Link 
                href="/dashboard/register" 
                onClick={() => setIsMenuOpen(false)}
                style={{ 
                  display: 'block', textAlign: 'center', background: 'var(--primary)', 
                  color: 'white', padding: '14px', borderRadius: '12px', 
                  fontWeight: 800, textDecoration: 'none', textTransform: 'uppercase', 
                  letterSpacing: '1px', fontSize: '0.9rem' 
                }}
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

