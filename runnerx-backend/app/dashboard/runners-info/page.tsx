import { prisma } from "@/lib/prisma";
import RunnersInfoClient from "./runners-info-client";

export const metadata = {
  title: "Runners Info | RunnerX Dashboard",
};

export default async function RunnersInfoPage() {
  const sites = await prisma.site.findMany({
    orderBy: { name: "asc" },
  });

  return <RunnersInfoClient initialSites={sites} />;
}
