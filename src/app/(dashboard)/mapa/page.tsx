'use client';
import dynamic from 'next/dynamic';

const MapaClient = dynamic(() => import('@/components/mapa/MapaClient'), {
  ssr: false,
});

const MapaPage = () => {
  return (
    <div className='h-full w-full'>
      <MapaClient />
    </div>
  );
};

export default MapaPage;
