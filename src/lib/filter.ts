import { searchNormalize } from '@/lib/utils';

export type Filtro = {
  input: string;
  etiquetasId: {
    id: string;
    include: boolean;
  }[];
  gruposId: {
    id: string;
    include: boolean;
  }[];
  condicionalEtiq: 'AND' | 'OR';
  condicionalGrupo: 'AND' | 'OR';
  instagram: string | undefined;
  mail: string | undefined;
  dni: string | undefined;
  telefono: string | undefined;
};

export type FuncionFiltrar = ({
  input,
  etiquetasId,
  gruposId,
  condicionalEtiq,
  condicionalGrupo,
  instagram,
  mail,
  dni,
  telefono,
}: Filtro) => void;

export function filterModelos<
  M extends {
    nombreCompleto: string;
    idLegible?: number;
    instagram: string;
    mail: string;
    dni: string;
    telefono: string;
    etiquetas: { id: string; grupoId: string }[];
  },
>(modelos: M[], search: Filtro): M[] {
  if (
    search.input === undefined &&
    search.etiquetasId === undefined &&
    search.gruposId === undefined &&
    search.instagram === undefined &&
    search.mail === undefined &&
    search.dni === undefined &&
    search.telefono === undefined
  )
    return modelos;

  const mod = modelos?.filter((modelo) => {
    return (
      (search.input === undefined ||
        searchNormalize(modelo.nombreCompleto, search.input) ||
        (modelo.idLegible &&
          searchNormalize(modelo.idLegible.toString(), search.input))) &&
      (search.instagram === undefined ||
        searchNormalize(modelo.instagram, search.instagram)) &&
      (search.mail === undefined ||
        searchNormalize(modelo.mail, search.mail)) &&
      (search.dni === undefined || searchNormalize(modelo.dni, search.dni)) &&
      (search.telefono === undefined ||
        searchNormalize(modelo.telefono, search.telefono)) &&
      (search.etiquetasId === undefined ||
        search.etiquetasId.length === 0 ||
        (search.condicionalEtiq === 'AND'
          ? search.etiquetasId.every((etiqueta) =>
              modelo.etiquetas.some(
                (et) =>
                  et.id === etiqueta.id &&
                  (etiqueta.include ? et.grupoId === etiqueta.id : true)
              )
            )
          : search.etiquetasId.some((etiqueta) =>
              modelo.etiquetas.some(
                (et) =>
                  et.id === etiqueta.id &&
                  (etiqueta.include ? et.grupoId === etiqueta.id : true)
              )
            ))) &&
      (search.gruposId === undefined ||
        search.gruposId.length === 0 ||
        (search.condicionalGrupo === 'AND'
          ? search.gruposId.every((grupo) =>
              modelo.etiquetas.some(
                (et) =>
                  et.grupoId === grupo.id &&
                  (grupo.include ? et.id === grupo.id : true)
              )
            )
          : search.gruposId.some((grupo) =>
              modelo.etiquetas.some(
                (et) =>
                  et.grupoId === grupo.id &&
                  (grupo.include ? et.id === grupo.id : true)
              )
            )))
    );
  });
  return mod;
}
