import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "./components/sidebar";
import { MobileHeader } from "./components/mobile-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: { name: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-layout">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>
      <Sidebar userName={user.name} />
      <MobileHeader userName={user.name} />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
