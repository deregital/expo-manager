'use client';
import { trpc } from '@/lib/trpc';
import { useSearchParams } from 'next/navigation';

export default function ModelosTabla() {
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
    <>
      <div>
        {modelos
          ? modelos?.map((modelo) => (
              <div key={modelo.id}>
                <p>{modelo.nombreCompleto}</p>
              </div>
            ))
          : 'Cargando...'}
      </div>
    </>
  );
}
