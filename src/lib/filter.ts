import { searchNormalize } from '@/lib/utils';

export type Filtro = {
  input: string;
  etiquetaId: string | undefined;
  grupoId: string | undefined;
};

export type FuncionFiltrar = ({ input, etiquetaId, grupoId }: Filtro) => void;

export function filterModelos<
  M extends {
    nombreCompleto: string;
    idLegible?: number;
    etiquetas: { id: string; grupoId: string }[];
  },
>(modelos: M[], search: Filtro): M[] {
  if (
    search.input === undefined &&
    search.etiquetaId === undefined &&
    search.grupoId === undefined
  )
    return modelos;

  const mod = modelos?.filter((modelo) => {
    return (
      (search.input === undefined ||
        searchNormalize(modelo.nombreCompleto, search.input) ||
        (modelo.idLegible &&
          searchNormalize(modelo.idLegible.toString(), search.input))) &&
      (search.etiquetaId === undefined ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.id === search.etiquetaId
        )) &&
      (search.grupoId === undefined ||
        modelo.etiquetas.some(
          (etiqueta) => etiqueta.grupoId === search.grupoId
        ))
    );
  });
  return mod;
}
