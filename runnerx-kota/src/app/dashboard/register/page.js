import { getEvents } from '@/lib/api';

export const metadata = {
  title: 'Choose Your Event — RunnerX',
};

export default async function RegisterPage() {
  const allEvents = await getEvents();
  
  const kotaEvents = allEvents.filter(e => e.siteFor === 'KTA');
  const otherEvents = allEvents.filter(e => e.siteFor !== 'KTA');

  const getCityFromCode = (code) => {
    switch(code) {
      case 'KTA': return 'Kota';
      case 'JDH': return 'Jodhpur';
      case 'UDP': return 'Udaipur';
      default: return code;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      {/* Header */}
      <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 900,
          color: 'var(--text)', marginBottom: '12px', textTransform: 'uppercase',
          letterSpacing: '0.04em', fontStyle: 'italic'
        }}>
          Choose Your Event
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Ready to hit the track? Select an upcoming marathon from our current locations and secure your spot today!
        </p>
      </div>

      {/* Kota Events Section */}
      {kotaEvents.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                Kota Events
             </h2>
             <div style={{ height: '2px', background: 'var(--border)', flexGrow: 1 }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {kotaEvents.map((event) => (
              <EventCard key={event.id} event={event} city="Kota" isPrimary={true} />
            ))}
          </div>
        </div>
      )}

      {/* Other Events Section */}
      {otherEvents.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>Expanding Across Rajasthan</p>
             <h2 style={{ fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text)' }}>
                RunnerX in Other Cities
             </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {otherEvents.map((event) => (
              <EventCard key={event.id} event={event} city={getCityFromCode(event.siteFor)} />
            ))}
          </div>
        </div>
      )}

      {allEvents.length === 0 && (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏃‍♂️</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px', textTransform: 'uppercase', fontStyle: 'italic' }}>
            No Events Found
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            New race dates are being finalized. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, city, isPrimary = false }) {
  const eventDate = new Date(event.date);
  const isRegistrationOpen = event.status === 'PUBLISHED' && new Date() <= new Date(event.registrationEnd);
  const categoryCount = event.categories?.length || 0;

  return (
    <a
      href={isRegistrationOpen ? `/event-register/${event.id}` : '#'}
      style={{
        textDecoration: 'none',
        pointerEvents: isRegistrationOpen ? 'auto' : 'none',
        opacity: isRegistrationOpen ? 1 : 0.8,
      }}
    >
      <div
        className="card hover-elevate transition-all duration-300"
        style={{
          padding: '0', overflow: 'hidden',
          border: '1px solid var(--border)', borderRadius: '16px',
          cursor: isRegistrationOpen ? 'pointer' : 'not-allowed',
          background: 'white', height: '100%', display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{
          height: 6,
          background: isRegistrationOpen
            ? isPrimary ? 'var(--primary)' : '#334155'
            : '#94a3b8',
        }} />

        <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '12px',
              background: isPrimary ? 'rgba(26,138,180,0.08)' : 'rgba(51,65,85,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', border: `1px solid ${isPrimary ? 'rgba(26,138,180,0.15)' : 'rgba(51,65,85,0.15)'}`
            }}>
              🏁
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 900, padding: '4px 12px',
              borderRadius: '20px', background: isRegistrationOpen ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              color: isRegistrationOpen ? '#16a34a' : '#dc2626',
              textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid currentColor'
            }}>
              {isRegistrationOpen ? 'Registration Open' : 'Closed'}
            </span>
          </div>

          <div style={{ marginBottom: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isPrimary ? 'var(--primary)' : '#64748b', textTransform: 'uppercase', tracking: '0.1em' }}>
              {city}
            </span>
          </div>
          <h3 style={{
            fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)',
            marginBottom: '16px', textTransform: 'uppercase', fontStyle: 'italic', lineHeight: 1.2
          }}>
            {event.title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.6 }}>📅</span>
              <span style={{ fontWeight: 600 }}>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.6 }}>📍</span>
              <span style={{ fontWeight: 600 }}>{event.venue}</span>
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ opacity: 0.6 }}>⭐</span>
              <span style={{ fontWeight: 600 }}>{categoryCount} Categories Available</span>
            </p>
          </div>

          <div style={{
            marginTop: 'auto', padding: '16px 0 0',
            borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'center'
          }}>
            {isRegistrationOpen ? (
              <span style={{
                fontSize: '0.9rem', fontWeight: 900, color: isPrimary ? 'var(--primary)' : '#334155',
                textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '0.05em'
              }}>
                Start Registration →
              </span>
            ) : (
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#94a3b8', fontStyle: 'italic' }}>
                Stay Tuned
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
