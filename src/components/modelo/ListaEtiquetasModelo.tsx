import AgregarEtiquetasAModelo from '@/components/modelo/AgregarEtiquetasAModelo';
import { useProfileData } from '@/components/modelo/ModeloPageContent';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import { trpc } from '@/lib/trpc';
import { TagWithGroupColor } from '@/server/types/etiquetas';
import { GetGlobalFilterResponseDto } from 'expo-backend-types';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileTagsListProps {
  profileId: string;
  tags: TagWithGroupColor[];
}

const ListaEtiquetasModelo = ({ tags, profileId }: ProfileTagsListProps) => {
  const [addTagOpen, setAddTagOpen] = useState(false);
  const editProfile = trpc.modelo.edit.useMutation();

  async function handleDelete(
    tag: GetGlobalFilterResponseDto['globalFilter'][number]
  ) {
    useProfileData.setState({
      tags: tags.filter((e) => e.id !== tag.id),
    });
    await editProfile
      .mutateAsync({
        id: profileId,
        tags: tags
          .filter((e) => e.id !== tag.id)
          .map((e) => ({
            id: e.id,
            name: e.name,
            group: {
              id: e.group.id,
              isExclusive: e.group.isExclusive,
            },
          })),
      })
      .then(() => toast.success(`Etiqueta ${tag.name} eliminada`))
      .catch(() => {
        useProfileData.setState({
          tags: [...tags, tag],
        });
        toast.error('Error al eliminar etiqueta');
      });
  }

  return (
    <ListaEtiquetas
      open={addTagOpen}
      setOpen={setAddTagOpen}
      tags={tags}
      handleDelete={handleDelete}
    >
      <AgregarEtiquetasAModelo
        closeAddTag={() => {
          setAddTagOpen(false);
        }}
        openAddTag={() => {
          setAddTagOpen(true);
        }}
      />
    </ListaEtiquetas>
  );
};

export default ListaEtiquetasModelo;
