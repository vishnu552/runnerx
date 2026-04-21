import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardSidebar from './DashboardSidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'USER') {
    redirect('/login');
  }

  async function logoutAction() {
    "use server";
    const { logoutUser } = await import('@/lib/actions');
    await logoutUser();
    redirect('/login');
  }

  return (
    <div style={{ background: 'var(--surface-alt)', minHeight: '80vh', padding: '140px 0 60px' }}>
      <div className="container">
        <div className="mb-4 lg:hidden">
          <DashboardSidebar user={user} logoutAction={logoutAction} mobile />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr] lg:gap-8">
          <div className="hidden lg:block">
            <DashboardSidebar user={user} logoutAction={logoutAction} />
          </div>
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
