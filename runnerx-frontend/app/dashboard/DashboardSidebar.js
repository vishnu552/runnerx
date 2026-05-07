'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const navItems = [
  { href: '/dashboard/profile', label: 'Profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { href: '/dashboard/registrations', label: 'My Events', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
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

export default function DashboardSidebar({ user, logoutAction }) {
  const pathname = usePathname();

  const isActiveLink = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // ─── Desktop sidebar ───
  return (
    <aside
      className="card"
      style={{ 
        borderRadius: '12px', position: 'sticky', top: 88, 
        background: 'white', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
      }}
    >

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
                background: isActive ? 'rgba(0,160,255,0.06)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />

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

      <div style={{ padding: '10px 14px 14px' }}>
        <Link
          href="/dashboard/register"
          style={{
            display: 'block', textAlign: 'center',
            background: 'var(--primary)', color: 'white',
            padding: '12px', borderRadius: '8px',
            fontSize: '0.9rem', fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(255,200,60,0.2)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
        >
          Register Now
        </Link>
      </div>
    </aside>
  );
}
