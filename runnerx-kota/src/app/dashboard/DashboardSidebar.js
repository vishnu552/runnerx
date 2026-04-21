'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { href: '/dashboard/registrations', label: 'My Events', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  )},
  { href: '/dashboard/orders', label: 'My Orders', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  )},
  { href: '/dashboard/coupon', label: 'Coupon', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
  )},
  { href: '/dashboard/support-cause', label: 'Support a Cause', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  )},
  { href: '/dashboard/share-story', label: 'Share Your Story', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
  )},
  { href: '/dashboard/contact', label: 'Contact', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  )},
  { href: '/dashboard/policy', label: 'Policy', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  )},
];

export default function DashboardSidebar({ user, logoutAction, mobile = false }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActiveLink = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const firstName = user.name?.split(' ')[0] || 'Runner';

  if (mobile) {
    return (
      <>
        {/* Mobile top bar trigger */}
        <section
          className="rounded-xl border bg-white p-3 shadow-sm"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '10px', padding: 0,
              }}
            >
              {/* Hamburger */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                Hey, {firstName}
              </span>
            </button>
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 700, flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </section>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 9999, display: 'flex',
            }}
          >
            {/* Backdrop */}
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
              }}
            />
            {/* Drawer */}
            <div
              style={{
                position: 'relative', width: '85%', maxWidth: 340,
                background: 'white', height: '100%',
                boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                animation: 'slideInLeft 0.25s ease-out',
                overflowY: 'auto',
              }}
            >
              {/* Drawer header */}
              <div style={{
                padding: '20px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 700,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>
                      Hey, {firstName}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Nav items */}
              <nav style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {navItems.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '8px',
                        textDecoration: 'none', fontSize: '0.95rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? 'var(--primary)' : 'var(--text)',
                        background: isActive ? 'rgba(11,110,79,0.06)' : 'transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}

                {/* Separator */}
                <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

                {/* Logout */}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 14px', borderRadius: '8px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      width: '100%', textAlign: 'left',
                      fontSize: '0.95rem', color: '#ef4444', fontWeight: 400,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </form>
              </nav>

              {/* Register Now — fixed at bottom */}
              <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <Link
                  href="/dashboard/register"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block', textAlign: 'center',
                    background: 'var(--primary)', color: 'white',
                    padding: '14px', borderRadius: '10px',
                    fontSize: '1rem', fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(11,110,79,0.25)',
                  }}
                >
                  Register Now
                </Link>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </>
    );
  }

  // ─── Desktop sidebar ───
  return (
    <aside
      className="rounded-xl border bg-white"
      style={{ borderColor: 'var(--border)', position: 'sticky', top: 140 }}
    >
      {/* Profile header */}
      <div
        style={{
          padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, flexShrink: 0,
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Hey, {firstName}
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-all' }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {navItems.map((item) => {
          const isActive = isActiveLink(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 14px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--primary)' : 'var(--text)',
                background: isActive ? 'rgba(11,110,79,0.06)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Separator */}
        <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              width: '100%', textAlign: 'left',
              fontSize: '0.9rem', color: '#ef4444',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </form>
      </nav>

      {/* Register Now — highlighted fixed */}
      <div style={{ padding: '10px 14px 14px' }}>
        <Link
          href="/dashboard/register"
          style={{
            display: 'block', textAlign: 'center',
            background: 'var(--primary)', color: 'white',
            padding: '12px', borderRadius: '8px',
            fontSize: '0.9rem', fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(11,110,79,0.2)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          Register Now
        </Link>
      </div>
    </aside>
  );
}
