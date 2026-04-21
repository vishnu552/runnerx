import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { getActiveEvent, getUserRegistrations, getEvents } from '@/lib/api';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const token = cookieStore.get('runnerx-user-token')?.value;
  const registrations = await getUserRegistrations(token);
  const activeEvent = await getActiveEvent('KTA');
  const allEvents = await getEvents();

  const regCount = registrations.length;
  const totalSpent = registrations.reduce((sum, r) => sum + (r.finalAmount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ padding: '40px 32px' }}>
        <h1 style={{ 
          fontSize: '2.2rem', fontWeight: 900, color: 'var(--text)', 
          marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic'
        }}>
          Welcome back, <span style={{color: 'var(--primary)'}}>{user?.name?.split(' ')[0]}</span>!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: 500 }}>
          Manage your registrations, track results, and update your personal information.
        </p>
      </div>

      {/* Stats */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Upcoming Event */}
        <div className="card hover-elevate" style={{ padding: '32px', borderTop: '6px solid var(--primary)', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏃</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', fontStyle: 'italic' }}>Upcoming Event</h2>
          {activeEvent ? (
            <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px', background: 'var(--bg-alt)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>{activeEvent.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 500 }}>
                📅 {new Date(activeEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • 📍 {activeEvent.venue}
              </p>
              <Link 
                href="/dashboard/register"
                className="btn btn-sm"
                style={{ 
                  backgroundColor: 'var(--primary)', 
                  color: 'white', 
                  padding: '10px 24px', 
                  borderRadius: '10px', 
                  fontSize: '0.85rem', 
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  border: 'none',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 12px rgba(0,160,255,0.2)'
                }}
              >
                Register Now →
              </Link>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No upcoming events right now.</p>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="card hover-elevate" style={{ padding: '32px', borderTop: '6px solid var(--accent)', transition: 'all 0.3s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🎫</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', fontStyle: 'italic' }}>Recent Registrations</h2>
          {registrations.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {registrations.slice(0, 3).map((reg) => (
                  <div key={reg.id} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-alt)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>{reg.eventTitleSnapshot}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{reg.lineItems?.length || 0} participant(s) • ₹{reg.finalAmount}</p>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 900, padding: '4px 10px', borderRadius: '20px',
                      background: reg.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(255,220,80,0.15)',
                      color: reg.status === 'CONFIRMED' ? '#16a34a' : '#b45309',
                      textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid currentColor'
                    }}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/registrations" style={{ 
                fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800, 
                textDecoration: 'none', textTransform: 'uppercase', fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                View all registrations →
              </Link>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No registrations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
