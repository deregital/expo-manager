import PresentismoPage from '@/components/eventos/presentismo/PresentismoPage';

interface PresentismoProps {
  params: {
    eventId: string;
  };
}

const Presentismo = ({ params }: PresentismoProps) => {
  return <PresentismoPage eventId={params.eventId} />;
};

export default Presentismo;
