import Greeting from '@/components/Greeting';
import { useState } from 'react';

export default function Home() {

    
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Greeting />
    </main>
  );
}
