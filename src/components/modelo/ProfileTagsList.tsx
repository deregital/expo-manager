import AddTagsToProfile from '@/components/modelo/AddTagsToProfile';
import { useProfileData } from '@/components/modelo/ProfilePageContent';
import ListaEtiquetas from '@/components/ui/ListaEtiquetas';
import { trpc } from '@/lib/trpc';
import { type TagWithGroupColor } from '@/server/types/etiquetas';
import { type GetGlobalFilterResponseDto } from 'expo-backend-types';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileTagsListProps {
  profileId: string;
  tags: TagWithGroupColor[];
}

const ProfileTagsList = ({ tags, profileId }: ProfileTagsListProps) => {
  const [addTagOpen, setAddTagOpen] = useState(false);
  const editProfile = trpc.profile.edit.useMutation();

  async function handleDelete(
    tag: GetGlobalFilterResponseDto['globalFilter'][number]
  ) {
    useProfileData.setState({
      tags: tags.filter((e) => e.id !== tag.id),
    });
    await editProfile
      .mutateAsync({
        id: profileId,
        tags: tags.filter((t) => t.id !== tag.id).map((t) => t.id),
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
      <AddTagsToProfile
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

export default ProfileTagsList;
