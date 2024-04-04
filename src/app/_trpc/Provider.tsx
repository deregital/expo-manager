'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useState } from 'react';

import { trpcClient as client } from './client';

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    client.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.VERCEL_URL ?? 'http://localhost:3000'}/api/trpc`,
        }),
      ],
    })
  );
  return (
    <client.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </client.Provider>
  );
};

export default Provider;
