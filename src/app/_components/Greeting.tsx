'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React from 'react';

const Greeting = () => {
  const trpcUtils = trpc.useUtils();
  const { data, isLoading, error } = trpc.hello.useQuery();
  return (
    <>
      <Button
        onClick={() => {
          trpcUtils.hello.reset();
        }}
      >
        Saludar
      </Button>
      <div className="font-bold text-black">
        {error ? (
          <div>Error: {error.message}</div>
        ) : isLoading ? (
          'Loading...'
        ) : (
          data?.greeting
        )}
      </div>
    </>
  );
};

export default Greeting;
