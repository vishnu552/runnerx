import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/lib/auth';
import { getOriginFromCookies } from '@/app/lib/origin';
import DashboardHeader from '@/app/components/DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'USER') {
    redirect('/login');
  }

  const { config: originConfig } = await getOriginFromCookies();

  async function logoutAction() {
    "use server";
    const { logoutUser } = await import('@/app/lib/actions');
    await logoutUser();
  }

  return (
    <>
      <DashboardHeader originConfig={originConfig} user={user} />
      <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingTop: '88px', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div className="mb-4 lg:hidden" style={{ marginBottom: '16px' }}>
            <DashboardSidebar user={user} logoutAction={logoutAction} mobile />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Desktop: sidebar + content side by side */}
            <div className="dashboard-grid">
              <div className="dashboard-sidebar-desktop">
                <DashboardSidebar user={user} logoutAction={logoutAction} />
              </div>
              <main>
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
