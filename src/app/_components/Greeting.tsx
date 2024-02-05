'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React from 'react';

const Greeting = () => {
  const trpcUtils = trpc.useUtils();
  const { data, isLoading } = trpc.hello.useQuery({
    text: 'Prueba',
  });
  return (
    <>
      <Button
        onClick={() => {
          trpcUtils.hello.reset({ text: 'Prueba' });
        }}
      >
        Saludar
      </Button>
      <div className="font-bold text-black">
        {isLoading ? 'Loading...' : data?.greeting}
      </div>
    </>
  );
};

export default Greeting;
