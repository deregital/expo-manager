import ProfilesChart from '@/components/dashboard/ProfilesChart';
import { Card, CardTitle } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import React from 'react';

interface GraficoCardProps {
  profiles: {
    date: string;
    profiles: number;
  }[];
  isLoading: boolean;
}

const ProfilesChartCard = ({ profiles, isLoading }: GraficoCardProps) => {
  return (
    <Card className='flex h-full min-h-48 flex-col p-2 sm:min-h-max'>
      <CardTitle className='pb-2 text-2xl font-extrabold sm:text-3xl'>
        Gráfico de participantes inscriptos
      </CardTitle>
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loader />
        </div>
      ) : Object.values(profiles).some((prof) => prof.profiles > 0) ? (
        <div className='h-full flex-1'>
          <ProfilesChart
            data={profiles}
            className='sm:min-h-auto my-auto h-full min-h-[200px] sm:max-h-full'
          />
        </div>
      ) : (
        <div className='flex h-full flex-1 items-center justify-center'>
          <p className='text-slate-500'>No hay datos para mostrar</p>
        </div>
      )}
    </Card>
  );
};

export default ProfilesChartCard;
