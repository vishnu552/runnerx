import RegistrationDetailClient from "./registration-detail-client";

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RegistrationDetailClient id={id} />;
}
