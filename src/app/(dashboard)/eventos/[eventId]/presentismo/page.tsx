import PresentismoPage from '@/components/eventos/presentismo/PresentismoPage';
import { headers } from 'next/headers';

interface PresentismoProps {
  params: {
    eventoId: string;
  };
}

const Presentismo = ({ params }: PresentismoProps) => {
  const headersList = headers();
  const hostname = headersList.get('x-forwarded-host');

  if (!hostname) {
    return null;
  }

  return <PresentismoPage eventId={params.eventoId} baseUrl={hostname} />;
};

export default Presentismo;
