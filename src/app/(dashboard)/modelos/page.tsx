'use client';
import FiltroTabla from '@/components/modelos/FiltroTabla';
import { trpc } from '@/lib/trpc';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const ModelosPage = () => {
  const searchParams = new URLSearchParams(useSearchParams());
  const { data: modelos } = trpc.modelo.getByFiltro.useQuery(getParams());
  function getParams() {
    return {
      nombre: searchParams.get('nombre') ?? undefined,
      etiquetaId: searchParams.get('etiqueta') ?? undefined,
      grupoId: searchParams.get('grupoId') ?? undefined,
    };
  }
  return (
    <div>
      <p>ModelosPage</p>
      <FiltroTabla />
      {modelos
        ? modelos.map((modelo) => (
            <div key={modelo.id}>
              <p>{modelo.nombreCompleto}</p>
            </div>
          ))
        : 'Cargando...'}
    </div>
  );
};

export default ModelosPage;
