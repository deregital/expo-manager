'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import React from 'react';

const Greeting = () => {
  const id = '00320cee-bf79-461a-91f7-d153514ad09a';
  const { data, error, isLoading } = trpc.perfil.getById.useQuery(id);

  return (
    <>
      {/* <Button
        onClick={() => {
          trpcUtils.hello.reset();
        }}
      >
        Saludar
      </Button> */}

      <div className="font-bold text-black">
        {error ? (
          <div>Error: {error.message}</div>
        ) : isLoading ? (
          'Loading...'
        ) : (
          JSON.stringify(data, null, 2)
        )}
      </div>
    </>
  );
};

export default Greeting;
