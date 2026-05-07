'use client';

export default function DashboardHeader({ originConfig, user }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Runner';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      height: '64px', display: 'flex', alignItems: 'center',
    }} className="dashboard-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* RunnerX Logo */}
        <a href="/dashboard/register" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/runnerxlogo.png" 
            alt="RunnerX" 
            style={{ height: '32px', width: 'auto', display: 'block' }} 
            className="header-logo"
          />
        </a>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {originConfig && (
          <a href={originConfig.url} style={{
            fontSize: '0.75rem', color: '#64748b', fontWeight: 600,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ffc83c'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
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
    </header>
  );
}
