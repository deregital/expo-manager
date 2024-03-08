'use client';

import { columns } from '@/components/modelos/table/columns';
import { DataTable } from '@/components/modelos/table/dataTable';
import { trpc } from '@/lib/trpc';
import React from 'react';

const ModelosPage = () => {
  const { data } = trpc.modelo.getAll.useQuery();

  return (
    <div>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
};

export default ModelosPage;
