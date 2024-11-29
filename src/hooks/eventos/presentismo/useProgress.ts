import { RouterOutputs } from '@/server';
import { useMemo } from 'react';

export function useProgress(
  modelos: RouterOutputs['modelo']['getByEtiqueta'],
  etiquetaAsistioId: string
) {
  return useMemo(() => {
    if (!modelos) return 0;
    const asistieron = modelos.filter((modelo) =>
      modelo.etiquetas.find((etiqueta) => etiqueta.id === etiquetaAsistioId)
    ).length;

    const porcentaje = (asistieron / modelos.length) * 100;

    if (isNaN(porcentaje)) return 0;
    return porcentaje % 1 === 0 ? porcentaje : Number(porcentaje.toFixed(2));
  }, [etiquetaAsistioId, modelos]);
}
