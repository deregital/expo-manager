import { searchNormalize } from '@/lib/utils';
import { Etiqueta, Perfil } from '@prisma/client';
import { type TagGroup } from 'expo-backend-types';

export type Filtro = {
  input: string;
  etiquetas: {
    etiqueta: Pick<Etiqueta, 'id' | 'nombre'>;
    include: boolean;
  }[];
  groups: {
    group: Pick<TagGroup, 'id' | 'color' | 'name'>;
    include: boolean;
  }[];
  condicionalEtiq: 'AND' | 'OR';
  condicionalGroup: 'AND' | 'OR';
  instagram: Perfil['instagram'];
  mail: Perfil['mail'];
  dni: Perfil['dni'];
  telefono: Perfil['telefono'];
  genero: Perfil['genero'];
};

export type FiltroTraducido = Omit<Filtro, 'groups'> & {
  grupos: Filtro['groups'];
  condicionalGrupo: Filtro['condicionalGroup'];
};

export type FuncionFiltrar = ({
  input,
  etiquetas,
  groups,
  condicionalEtiq,
  condicionalGroup,
  instagram,
  mail,
  dni,
  telefono,
  genero,
}: Filtro) => void;

export const defaultFilter: Filtro = {
  input: '',
  etiquetas: [],
  groups: [],
  condicionalEtiq: 'AND',
  condicionalGroup: 'AND',
  instagram: '',
  mail: '',
  dni: '',
  telefono: '',
  genero: '',
};

export function filterModelos<
  M extends {
    nombreCompleto: string;
    idLegible?: number;
    instagram: Perfil['instagram'];
    mail: Perfil['mail'];
    dni: Perfil['dni'];
    telefono: Perfil['telefono'];
    genero: Perfil['genero'];
    etiquetas: { id: string; grupoId: string }[];
  },
>(modelos: M[], search: Partial<Filtro>): M[] {
  if (
    search.input === undefined &&
    search.etiquetas &&
    search.etiquetas.length === 0 &&
    search.groups &&
    search.groups.length === 0 &&
    search.instagram === undefined &&
    search.mail === undefined &&
    search.dni === undefined &&
    search.telefono === undefined &&
    search.genero === undefined
  )
    return modelos;

  const etiquetasInclude = search.etiquetas?.filter((et) => et.include) ?? [];
  const etiquetasNotInclude =
    search.etiquetas?.filter((et) => !et.include) ?? [];

  const groupsInclude = search.groups?.filter((gr) => gr.include) ?? [];
  const groupsNotInclude = search.groups?.filter((gr) => !gr.include) ?? [];

  const mod = modelos?.filter((modelo) => {
    return (
      (search.input === undefined ||
        searchNormalize(modelo.nombreCompleto, search.input) ||
        (modelo.idLegible &&
          searchNormalize(modelo.idLegible.toString(), search.input))) &&
      (search.instagram === undefined ||
        search.instagram === null ||
        searchNormalize(modelo.instagram ?? '', search.instagram)) &&
      (search.mail === undefined ||
        search.mail === null ||
        searchNormalize(modelo.mail ?? '', search.mail)) &&
      (search.dni === undefined ||
        search.dni === null ||
        searchNormalize(modelo.dni ?? '', search.dni)) &&
      (search.telefono === undefined ||
        searchNormalize(modelo.telefono, search.telefono)) &&
      (search.genero === undefined ||
        search.genero === null ||
        searchNormalize(modelo.genero ?? '', search.genero)) &&
      (search.etiquetas === undefined ||
        search.etiquetas.length === 0 ||
        (search.condicionalEtiq === 'AND'
          ? etiquetasInclude.every(({ etiqueta }) =>
              modelo.etiquetas.some((et) => et.id === etiqueta.id)
            ) &&
            etiquetasNotInclude.every(({ etiqueta }) =>
              modelo.etiquetas.every((et) => et.id !== etiqueta.id)
            )
          : etiquetasInclude.some(({ etiqueta }) =>
              modelo.etiquetas.some((et) => et.id === etiqueta.id)
            ) &&
            etiquetasNotInclude.some(({ etiqueta }) =>
              modelo.etiquetas.every((et) => et.id !== etiqueta.id)
            ))) &&
      (search.groups === undefined ||
        search.groups.length === 0 ||
        (search.condicionalGroup === 'AND'
          ? groupsInclude.every(({ group }) =>
              modelo.etiquetas.some((et) => et.grupoId === group.id)
            ) &&
            groupsNotInclude.every(({ group }) =>
              modelo.etiquetas.every((et) => et.grupoId !== group.id)
            )
          : groupsInclude.some(({ group }) =>
              modelo.etiquetas.some((et) => et.grupoId === group.id)
            ) &&
            groupsNotInclude.some(({ group }) =>
              modelo.etiquetas.every((et) => et.grupoId !== group.id)
            )))
    );
  });
  return mod;
}
