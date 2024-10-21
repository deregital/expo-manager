import { searchNormalize } from '@/lib/utils';
import { Perfil } from '@prisma/client';
import type { Tag, TagGroup } from 'expo-backend-types';

export type Filtro = {
  input: string;
  tags: {
    tag: Pick<Tag, 'id' | 'name'>;
    include: boolean;
  }[];
  groups: {
    group: Pick<TagGroup, 'id' | 'color' | 'name'>;
    include: boolean;
  }[];
  condicionalTag: 'AND' | 'OR';
  condicionalGroup: 'AND' | 'OR';
  instagram: Perfil['instagram'];
  mail: Perfil['mail'];
  dni: Perfil['dni'];
  telefono: Perfil['telefono'];
  genero: Perfil['genero'];
};

export type FiltroTraducido = Omit<Filtro, 'groups'> & {
  grupos: Filtro['groups'];
  etiquetas: Filtro['tags'];
  condicionalGrupo: Filtro['condicionalGroup'];
  condicionalEtiq: Filtro['condicionalTag'];
};

export type FuncionFiltrar = ({
  input,
  tags,
  groups,
  condicionalTag,
  condicionalGroup,
  instagram,
  mail,
  dni,
  telefono,
  genero,
}: Filtro) => void;

export const defaultFilter: Filtro = {
  input: '',
  tags: [],
  groups: [],
  condicionalTag: 'AND',
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
    search.tags &&
    search.tags.length === 0 &&
    search.groups &&
    search.groups.length === 0 &&
    search.instagram === undefined &&
    search.mail === undefined &&
    search.dni === undefined &&
    search.telefono === undefined &&
    search.genero === undefined
  )
    return modelos;

  const tagsInclude = search.tags?.filter((et) => et.include) ?? [];
  const tagsNotInclude = search.tags?.filter((et) => !et.include) ?? [];

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
        searchNormalize(
          modelo.genero ?? '',
          search.genero !== 'Todos' ? search.genero : ''
        )) &&
      (search.tags === undefined ||
        search.tags.length === 0 ||
        (search.condicionalTag === 'AND'
          ? tagsInclude.every(({ tag }) =>
              modelo.etiquetas.some((et) => et.id === tag.id)
            ) &&
            tagsNotInclude.every(({ tag }) =>
              modelo.etiquetas.every((et) => et.id !== tag.id)
            )
          : tagsInclude.some(({ tag }) =>
              modelo.etiquetas.some((et) => et.id === tag.id)
            ) &&
            tagsNotInclude.some(({ tag }) =>
              modelo.etiquetas.every((et) => et.id !== tag.id)
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
