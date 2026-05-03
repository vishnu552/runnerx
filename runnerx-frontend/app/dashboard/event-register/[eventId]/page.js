import { getCurrentUser } from '@/app/lib/auth';
import { getEventById } from '@/app/lib/api';
import RegistrationClient from './RegistrationClient';

export default async function EventRegisterPage({ params }) {
  const { eventId } = await params;
  const user = await getCurrentUser();
  const event = await getEventById(eventId);

  return <RegistrationClient currentUser={user} event={event} />;
}
