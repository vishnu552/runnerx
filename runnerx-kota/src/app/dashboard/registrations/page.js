import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { getUserRegistrations, getActiveEvent } from '@/lib/api';
import RegistrationsClient from '@/components/RegistrationsClient';

export const metadata = {
  title: 'My Registrations — RunnerX',
};

export default async function MyRegistrationsPage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const token = cookieStore.get('runnerx-user-token')?.value;
  const registrations = await getUserRegistrations(token);
  const activeEvent = await getActiveEvent('KTA');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '600px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', 
            marginBottom: '4px', fontStyle: 'italic', textTransform: 'uppercase', 
            fontFamily: 'var(--font-heading)' 
          }}>
            My Registrations
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {registrations.length} registration{registrations.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {activeEvent && (
          <a
            href={`/event-register/${activeEvent.id}`}
            className="btn btn-primary"
            style={{ 
              padding: '12px 24px', fontStyle: 'italic', textTransform: 'uppercase', 
              fontSize: '0.9rem', borderRadius: '10px' 
            }}
          >
            + New Registration
          </a>
        )}
      </div>

      {/* Registrations Client Component */}
      {registrations.length > 0 ? (
        <RegistrationsClient registrations={registrations} />
      ) : (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>🏃‍♂️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px', textTransform: 'uppercase', fontStyle: 'italic' }}>
            No Registrations Yet
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '32px', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
            You haven&apos;t registered for any marathons yet. Don&apos;t just watch from the sidelines—get in on the action!
          </p>
          {activeEvent ? (
            <a
              href={`/event-register/${activeEvent.id}`}
              className="btn btn-primary"
              style={{ padding: '14px 32px', fontStyle: 'italic', fontSize: '1rem' }}
            >
              Register for {activeEvent.title} →
            </a>
          ) : (
            <a href="/categories" style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', fontSize: '1.1rem' }}>
              Explore Categories →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
