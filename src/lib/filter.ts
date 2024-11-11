import { searchNormalize } from '@/lib/utils';
import type { Tag, TagGroup, Profile } from 'expo-backend-types';

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
  instagram: Profile['instagram'];
  mail: Profile['mail'];
  dni: Profile['dni'];
  phoneNumber: Profile['phoneNumber'];
  gender: Profile['gender'];
};

export type FiltroTraducido = Omit<
  Filtro,
  | 'groups'
  | 'tags'
  | 'condicionalTag'
  | 'condicionalGroup'
  | 'telefono'
  | 'genero'
> & {
  grupos: Filtro['groups'];
  etiquetas: Filtro['tags'];
  condicionalGrupo: Filtro['condicionalGroup'];
  condicionalEtiq: Filtro['condicionalTag'];
  telefono: Filtro['phoneNumber'];
  genero: Filtro['gender'];
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
  phoneNumber,
  gender,
}: Filtro) => void;

export const defaultAdvancedFilter: Filtro = {
  input: '',
  tags: [],
  groups: [],
  condicionalTag: 'AND',
  condicionalGroup: 'AND',
  instagram: '',
  mail: '',
  dni: '',
  phoneNumber: '',
  gender: '',
};

export function filterProfiles<
  M extends {
    fullName: Profile['fullName'];
    shortId?: Profile['shortId'];
    instagram: Profile['instagram'];
    mail: Profile['mail'];
    dni: Profile['dni'];
    phoneNumber: Profile['phoneNumber'];
    gender: Profile['gender'];
    tags: { id: string; groupId: string }[];
  },
>(profiles: M[], search: Partial<Filtro>): M[] {
  if (
    search.input === undefined &&
    search.tags &&
    search.tags.length === 0 &&
    search.groups &&
    search.groups.length === 0 &&
    search.instagram === undefined &&
    search.mail === undefined &&
    search.dni === undefined &&
    search.phoneNumber === undefined &&
    search.gender === undefined
  )
    return profiles;

  const tagsInclude = search.tags?.filter((et) => et.include) ?? [];
  const tagsNotInclude = search.tags?.filter((et) => !et.include) ?? [];

  const groupsInclude = search.groups?.filter((gr) => gr.include) ?? [];
  const groupsNotInclude = search.groups?.filter((gr) => !gr.include) ?? [];

  const mod = profiles?.filter((profile) => {
    return (
      (search.input === undefined ||
        searchNormalize(profile.fullName, search.input) ||
        (profile.shortId &&
          searchNormalize(profile.shortId.toString(), search.input))) &&
      (search.instagram === undefined ||
        search.instagram === null ||
        searchNormalize(profile.instagram ?? '', search.instagram)) &&
      (search.mail === undefined ||
        search.mail === null ||
        searchNormalize(profile.mail ?? '', search.mail)) &&
      (search.dni === undefined ||
        search.dni === null ||
        searchNormalize(profile.dni ?? '', search.dni)) &&
      (search.phoneNumber === undefined ||
        searchNormalize(profile.phoneNumber, search.phoneNumber)) &&
      (search.gender === undefined ||
        search.gender === null ||
        searchNormalize(
          profile.gender ?? '',
          search.gender !== 'Todos' ? search.gender : ''
        )) &&
      (search.tags === undefined ||
        search.tags.length === 0 ||
        (search.condicionalTag === 'AND'
          ? tagsInclude.every(({ tag }) =>
              profile.tags.some((et) => et.id === tag.id)
            ) &&
            tagsNotInclude.every(({ tag }) =>
              profile.tags.every((et) => et.id !== tag.id)
            )
          : tagsInclude.some(({ tag }) =>
              profile.tags.some((et) => et.id === tag.id)
            ) &&
            tagsNotInclude.some(({ tag }) =>
              profile.tags.every((et) => et.id !== tag.id)
            ))) &&
      (search.groups === undefined ||
        search.groups.length === 0 ||
        (search.condicionalGroup === 'AND'
          ? groupsInclude.every(({ group }) =>
              profile.tags.some((et) => et.groupId === group.id)
            ) &&
            groupsNotInclude.every(({ group }) =>
              profile.tags.every((et) => et.groupId !== group.id)
            )
          : groupsInclude.some(({ group }) =>
              profile.tags.some((et) => et.groupId === group.id)
            ) &&
            groupsNotInclude.some(({ group }) =>
              profile.tags.every((et) => et.groupId !== group.id)
            )))
    );
  });
  return mod;
}
