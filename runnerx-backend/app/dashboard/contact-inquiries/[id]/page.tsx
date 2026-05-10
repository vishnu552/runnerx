import ContactInquiryDetailClient from "./contact-inquiry-detail-client";

export default async function ContactInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactInquiryDetailClient id={id} />;
}
