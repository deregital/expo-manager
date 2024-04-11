'use client';

import Greeting from '@/components/dashboard/Greeting';
import PageClient from '@/components/dashboard/PageClient';

const Home = () => {
  return (
    <main className='grid h-full grid-cols-1 gap-2 p-5 grid-areas-dashboardSmall sm:grid-cols-3 sm:grid-rows-[10%,65%,25%] sm:grid-areas-dashboardLarge [&_section]:h-min sm:[&_section]:h-auto'>
     <Greeting/> 
    </main>
  );
};

export default Home;
