'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import TagGroupComboBox from './TagGroupComboBox';
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import EtiquetaFillIcon from '@/components/icons/EtiquetaFillIcon';
import {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { type FindAllWithTagsResponseDto } from 'expo-backend-types';

interface TagModalProps {
  action: 'CREATE' | 'EDIT';
  tag?: FindAllWithTagsResponseDto['groups'][number]['tags'][number];
}

type ModalData = {
  type: 'CREATE' | 'EDIT';
  groupId: string;
  name: string;
  tagId: string;
};

export const useTagModalData = create<ModalData>(() => ({
  type: 'CREATE',
  groupId: '',
  name: '',
  tagId: '',
}));

const TagModal = ({ action, tag }: TagModalProps) => {
  const { data: tagGroupsData, isLoading } = trpc.tagGroup.getAll.useQuery();

  const utils = trpc.useUtils();
  const modalData = useTagModalData((state) => ({
    tagId: state.tagId,
    type: state.type,
    name: state.name,
  }));
  const [open, setOpen] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const createTag = trpc.tag.create.useMutation();
  const editTag = trpc.tag.edit.useMutation();
  const deleteTag = trpc.tag.delete.useMutation();

  async function sendTag() {
    if (modalData.type === 'CREATE') {
      await createTag
        .mutateAsync({
          name: modalData.name,
          groupId: useTagModalData.getState().groupId,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta creada con éxito');
        })
        .catch((error) => {
          toast.error(
            'Error al crear la etiqueta, asegúrese de poner un nombre y seleccionar un grupo de etiquetas'
          );
        });
    } else if (modalData.type === 'EDIT') {
      await editTag
        .mutateAsync({
          id: useTagModalData.getState().tagId,
          name: modalData.name,
          groupId: useTagModalData.getState().groupId,
        })
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta editada con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al editar la etiqueta');
        });
    }

    if (createTag.isSuccess || editTag.isSuccess) {
      useTagModalData.setState({
        type: 'CREATE',
        groupId: '',
        name: '',
        tagId: '',
      });
    }

    utils.tag.getByNombre.invalidate();
  }

  async function handleCancel() {
    useTagModalData.setState({
      type: 'CREATE',
      groupId: '',
      name: '',
      tagId: '',
    });
    createTag.reset();
    editTag.reset();
  }

  async function handleDelete() {
    if (shouldDelete) {
      await deleteTag
        .mutateAsync(modalData.tagId)
        .then(() => {
          setOpen(!open);
          toast.success('Etiqueta eliminada con éxito');
        })
        .catch((error) => {
          console.log(error);
          toast.error('Error al eliminar la etiqueta');
        });

      if (createTag.isSuccess || editTag.isSuccess) {
        useTagModalData.setState({
          type: 'CREATE',
          groupId: '',
          name: '',
          tagId: '',
        });
      }

      utils.tag.getByNombre.invalidate();
    } else {
      setShouldDelete(true);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <>
            {action === 'CREATE' ? (
              <ModalTriggerCreate
                onClick={() => {
                  setOpen(true);
                  useTagModalData.setState({
                    type: 'CREATE',
                    name: '',
                    groupId: '',
                    tagId: '',
                  });
                }}
              >
                <span>
                  <EtiquetaFillIcon className='mr-3 h-6 w-6' />
                </span>
                Crear etiqueta
              </ModalTriggerCreate>
            ) : (
              <ModalTriggerEdit
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);
                  useTagModalData.setState({
                    type: 'EDIT',
                    tagId: tag?.id ?? '',
                    name: tag?.name ?? '',
                    groupId: tag?.groupId ?? '',
                  });
                }}
              >
                <EditFillIcon />
              </ModalTriggerEdit>
            )}
          </>
        </DialogTrigger>
        <DialogContent
          onCloseAutoFocus={handleCancel}
          className='flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
        >
          <div className='flex flex-col gap-y-0.5'>
            <p className='w-fit py-1.5 text-base font-semibold'>
              {(modalData.type === 'CREATE' && 'Crear etiqueta') ||
                (modalData.type === 'EDIT' && 'Editar etiqueta')}
            </p>
            <div className='flex gap-x-3'>
              <Input
                className='bg-white text-black'
                type='text'
                name='etiqueta'
                id='etiqueta'
                placeholder='Nombre de la etiqueta'
                value={modalData.name}
                onChange={(e) =>
                  useTagModalData.setState({ name: e.target.value })
                }
              />
              {isLoading ? (
                <Loader />
              ) : (
                <TagGroupComboBox data={tagGroupsData ?? []} />
              )}
            </div>
          </div>
          {createTag.isError || editTag.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createTag.isError
                ? createTag.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  createTag.error?.data?.zodError?.fieldErrors.grupoId?.[0] ||
                  'Error al crear la etiqueta, asegúrese de poner un nombre y asignarle un grupo'
                : ''}
              {editTag.isError
                ? editTag.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  editTag.error?.data?.zodError?.fieldErrors.grupoId?.[0] ||
                  'Error al editar la etiqueta'
                : ''}
            </p>
          ) : null}
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={sendTag}
              disabled={editTag.isLoading || createTag.isLoading}
            >
              {((editTag.isLoading || createTag.isLoading) && <Loader />) ||
                (modalData.type === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.type === 'EDIT' && (
              <>
                <Button
                  variant='destructive'
                  className={cn('h-auto text-wrap', {
                    'bg-red-700 hover:bg-red-500': shouldDelete,
                  })}
                  onClick={handleDelete}
                  disabled={
                    tag?._count.profiles !== undefined &&
                    tag._count.profiles > 0
                  }
                >
                  {tag?._count.profiles === 0
                    ? shouldDelete
                      ? '¿Estás seguro?'
                      : 'Eliminar'
                    : 'No se puede eliminar, la etiqueta tiene participantes asociados'}
                </Button>
                {shouldDelete && (
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setShouldDelete(false);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TagModal;
