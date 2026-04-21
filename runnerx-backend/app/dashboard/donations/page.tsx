import DonationsClient from "./donations-client";

export const metadata = {
  title: "Donations | Admin Dashboard",
  description: "Manage and track all donations",
};

export default function DonationsPage() {
  return <DonationsClient />;
}
