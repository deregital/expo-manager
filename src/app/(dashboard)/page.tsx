'use client';

import PageClient from '@/components/dashboard/PageClient';

const Home = () => {
  return (
    <main className='grid h-full grid-cols-1 grid-rows-[repeat(8,minmax(0,min-content))] gap-2 p-5 grid-areas-dashboardSmall sm:grid-cols-3 sm:grid-rows-[10%,auto,25%] sm:grid-areas-dashboardLarge [&_section]:h-min sm:[&_section]:h-auto'>
      <PageClient />
    </main>
  );
};

export default Home;
