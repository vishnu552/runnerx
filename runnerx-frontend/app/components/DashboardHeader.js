'use client';

export default function DashboardHeader({ originConfig, user }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Runner';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      height: '64px', display: 'flex', alignItems: 'center',
      padding: '0 24px', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* RunnerX Logo */}
        <a href="/dashboard/register" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.4rem', fontWeight: 900, fontStyle: 'italic',
            color: '#0f172a', letterSpacing: '-0.02em',
          }}>
            RUNNER<span style={{ color: '#ffc83c' }}>X</span>
          </span>
        </a>

        {/* Origin badge */}
        {/* {originConfig && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px',
            borderRadius: '20px', background: 'rgba(255,200,60,0.08)',
            color: '#ffc83c', textTransform: 'uppercase',
            border: '1px solid rgba(255,200,60,0.2)',
            letterSpacing: '0.04em',
          }}>
            📍 {originConfig.name}
          </span>
        )} */}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {originConfig && (
          <a href={originConfig.url} style={{
            fontSize: '0.85rem', color: '#64748b', fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffc83c'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            ← Back to {originConfig.name} Site
          </a>
        )}

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #e2e8f0' }}>
            <div className="header-user-info" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Hey, {firstName}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{user.email}</div>
            </div>
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#ffc83c', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800,
                boxShadow: '0 4px 12px rgba(255,200,60,0.2)'
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
