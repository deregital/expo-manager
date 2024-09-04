import { searchNormalize } from '@/lib/utils';
import { Perfil } from '@prisma/client';

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
  instagram: Perfil['instagram'];
  mail: Perfil['mail'];
  dni: Perfil['dni'];
  telefono: Perfil['telefono'];
  genero: Perfil['genero'];
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
  genero,
}: Filtro) => void;

export function filterModelos<
  M extends {
    nombreCompleto: string;
    idLegible?: number;
    instagram: string;
    mail: string;
    dni: string;
    telefono: string;
    genero: string;
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
    search.telefono === undefined &&
    search.genero === undefined
  )
    return modelos;

  const mod = modelos?.filter((modelo) => {
    return (
      (search.input === undefined ||
        searchNormalize(modelo.nombreCompleto, search.input) ||
        (modelo.idLegible &&
          searchNormalize(modelo.idLegible.toString(), search.input))) &&
      (search.instagram === undefined ||
        search.instagram === null ||
        searchNormalize(modelo.instagram, search.instagram)) &&
      (search.mail === undefined ||
        search.mail === null ||
        searchNormalize(modelo.mail, search.mail)) &&
      (search.dni === undefined ||
        search.dni === null ||
        searchNormalize(modelo.dni, search.dni)) &&
      (search.telefono === undefined ||
        searchNormalize(modelo.telefono, search.telefono)) &&
      (search.genero === undefined ||
        search.genero === null ||
        searchNormalize(modelo.genero, search.genero)) &&
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
