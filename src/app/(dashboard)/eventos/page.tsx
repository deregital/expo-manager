import EventosPageClient from '@/app/(dashboard)/eventos/page.client';
import { headers } from 'next/headers';

const EventosPage = () => {
  const headersList = headers();
  const hostname = headersList.get('x-forwarded-host');

  if (!hostname) {
    return null;
  }

  return <EventosPageClient hostname={hostname} />;
};

export default EventosPage;
