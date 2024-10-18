'use client';
import { useMemo, useState } from 'react';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { LockIcon, UnlockIcon } from 'lucide-react';
import ColorPicker from '@/components/ui/ColorPicker';
import { cn, randomColor } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import EditFillIcon from '@/components/icons/EditFillIcon';
import { toast } from 'sonner';
import Loader from '@/components/ui/loader';
import { RouterOutputs } from '@/server';
import ModelosConflict from '@/components/etiquetas/modal/ModelosConflict';
import { GrupoConMatch } from '@/components/etiquetas/list/EtiquetasList';

interface TagGroupModalProps {
  action: 'EDIT' | 'CREATE';
  group?: GrupoConMatch;
}

type GrupoEtiquetaModalData = {
  type: 'CREATE' | 'EDIT';
  name: string;
  groupId: string;
  color: string;
  isExclusive: boolean;
};

export const useTagGroupModalData = create<GrupoEtiquetaModalData>(() => ({
  type: 'CREATE',
  name: '',
  groupId: '',
  color: '',
  isExclusive: false,
}));

const GrupoEtiquetaModal = ({ action, group }: TagGroupModalProps) => {
  const [open, setOpen] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const [conflict, setConflict] = useState<
    RouterOutputs['modelo']['getByGrupoEtiqueta'] | undefined
  >(undefined);
  const utils = trpc.useUtils();
  const createTagGroup = trpc.tagGroup.create.useMutation();
  const editTagGroup = trpc.tagGroup.edit.useMutation();
  const deleteTagGroup = trpc.tagGroup.delete.useMutation();

  const { data: modelosGrupo, isLoading: modelosGrupoLoading } =
    trpc.modelo.getByGrupoEtiqueta.useQuery([group?.id ?? ''], {
      enabled: action === 'EDIT' && group?.id !== undefined,
      onSuccess(data) {
        if (action === 'CREATE') return;
        if (conflict === undefined) return;

        setConflict(
          data
            .filter(
              (modelo) =>
                modelo.etiquetas.filter(
                  (etiqueta) => etiqueta.grupoId === group?.id
                ).length > 1
            )
            .map((modelo) => ({
              ...modelo,
              etiquetas: modelo.etiquetas.filter(
                (etiqueta) => etiqueta.grupoId === group?.id
              ),
            }))
        );
      },
    });

  const modalData = useTagGroupModalData((state) => ({
    type: state.type,
    name: state.name,
    groupId: state.groupId,
    color: state.color,
    isExclusive: state.isExclusive,
  }));

  const canDelete = group?._count.tags === 0;

  async function handleCancel() {
    useTagGroupModalData.setState({
      type: 'CREATE',
      name: '',
      groupId: '',
      color: randomColor(),
      isExclusive: false,
    });
    createTagGroup.reset();
    editTagGroup.reset();
  }

  async function handleSubmit() {
    const { type, name, groupId, color, isExclusive } =
      useTagGroupModalData.getState();
    if (type === 'CREATE') {
      await createTagGroup
        .mutateAsync({
          name,
          color: color,
          isExclusive,
        })
        .then(() => {
          setOpen(false);
          utils.tagGroup.getAll.invalidate();
          toast.success('Grupo de etiquetas creado con éxito');
        })
        .catch((e) => {
          setOpen(true);
          toast.error(
            'Error al crear el grupo de etiquetas, asegúrese de poner un nombre y un color'
          );
        });
    } else if (type === 'EDIT') {
      if (isExclusive === true && group?.isExclusive === false) {
        const conflict =
          modelosGrupo &&
          modelosGrupo
            .filter(
              (modelo) =>
                modelo.etiquetas.filter(
                  (etiqueta) => etiqueta.grupoId === groupId
                ).length > 1
            )
            .map((modelo) => ({
              ...modelo,
              etiquetas: modelo.etiquetas.filter(
                (etiqueta) => etiqueta.grupoId === groupId
              ),
            }));

        if (conflict && conflict.length > 0) {
          setOpen(true);
          toast.error(
            'No se puede cambiar a exclusivo si hay participantes que tienen más de una etiqueta de este grupo'
          );
          setConflict(conflict);
          return;
        }
      }

      setConflict(undefined);

      await editTagGroup
        .mutateAsync({
          id: groupId,
          name,
          color,
          isExclusive,
        })
        .then(() => {
          setOpen(false);
          utils.tagGroup.getAll.invalidate();
          if (group) {
            utils.modelo.getByGrupoEtiqueta.invalidate([group.id]);
          }
          toast.success('Grupo de etiquetas editado con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al editar el grupo de etiquetas');
        });
    }

    if (createTagGroup.isSuccess || editTagGroup.isSuccess) {
      useTagGroupModalData.setState({
        type: 'CREATE',
        name: '',
        groupId: '',
        color: randomColor(),
        isExclusive: false,
      });
    }

    utils.etiqueta.getByNombre.invalidate();
  }

  async function handleDelete() {
    if (shouldDelete) {
      await deleteTagGroup
        .mutateAsync(group?.id ?? '')
        .then(() => {
          setOpen(false);
          utils.etiqueta.getByNombre.invalidate();
          toast.success('Grupo de etiquetas eliminado con éxito');
        })
        .catch(() => {
          setOpen(true);
          toast.error('Error al eliminar el grupo de etiquetas');
        });
    } else {
      setShouldDelete(true);
    }
  }

  const submitDisabled = useMemo(() => {
    if (modalData.type === 'CREATE') {
      return createTagGroup.isLoading || conflict !== undefined;
    } else {
      return (
        editTagGroup.isLoading || conflict !== undefined || modelosGrupoLoading
      );
    }
  }, [
    conflict,
    createTagGroup.isLoading,
    editTagGroup.isLoading,
    modalData.type,
    modelosGrupoLoading,
  ]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {action === 'CREATE' ? (
            <Button
              className='rounded-md bg-gray-400 px-5 py-0.5 text-gray-950 hover:bg-gray-300'
              onClick={() => {
                setOpen(true);
                useTagGroupModalData.setState({
                  type: 'CREATE',
                  name: '',
                  groupId: '',
                  color: randomColor(),
                  isExclusive: false,
                });
              }}
            >
              <span>
                <EtiquetasFillIcon className='mr-3 h-6 w-6' />
              </span>
              Crear grupo de etiquetas
            </Button>
          ) : (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
                useTagGroupModalData.setState({
                  type: 'EDIT',
                  groupId: group?.id ?? '',
                  name: group?.name ?? '',
                  color: group?.color ?? '',
                  isExclusive: group?.isExclusive ?? false,
                });
              }}
              className={cn(
                buttonVariants({
                  variant: 'ghost',
                }),
                'flex h-fit items-center rounded-full p-0.5'
              )}
            >
              <EditFillIcon />
            </div>
          )}
        </DialogTrigger>
        <DialogContent
          onClick={(e) => {
            e.stopPropagation();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            setOpen(false);
            setConflict(undefined);
            handleCancel();
          }}
          className='flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-5 py-3 md:mx-auto md:max-w-2xl'
        >
          <div className='flex flex-col gap-y-1'>
            <p className='w-fit py-1.5 text-base font-semibold'>
              {(modalData.type === 'CREATE' && 'Crear grupo de etiquetas') ||
                (modalData.type === 'EDIT' && 'Editar grupo de etiquetas')}
            </p>
            <div className='relative flex items-center gap-x-2'>
              <Input
                type='text'
                name='group'
                id='group'
                placeholder='Nombre del grupo'
                value={modalData.name}
                onChange={(e) => {
                  useTagGroupModalData.setState({
                    name: e.target.value,
                  });
                }}
              />
              <div className='flex items-center gap-x-2'>
                {modalData.isExclusive ? (
                  <LockIcon
                    onClick={() => {
                      useTagGroupModalData.setState({
                        isExclusive:
                          !useTagGroupModalData.getState().isExclusive,
                      });
                    }}
                    className={cn('h-6 w-6 hover:cursor-pointer')}
                  />
                ) : (
                  <UnlockIcon
                    onClick={() => {
                      useTagGroupModalData.setState({
                        isExclusive:
                          !useTagGroupModalData.getState().isExclusive,
                      });
                    }}
                    className={cn('h-6 w-6 hover:cursor-pointer')}
                  />
                )}

                <ColorPicker
                  color={modalData.color}
                  setColor={(color) => {
                    useTagGroupModalData.setState({
                      color: color,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {createTagGroup.isError || editTagGroup.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createTagGroup.isError
                ? createTagGroup.error?.data?.zodError?.fieldErrors
                    .nombre?.[0] ||
                  createTagGroup.error?.data?.zodError?.fieldErrors
                    .color?.[0] ||
                  'Error al crear el grupo, asegúrese de poner un nombre y un color'
                : ''}
              {editTagGroup.isError
                ? editTagGroup.error?.data?.zodError?.fieldErrors.nombre?.[0] ||
                  editTagGroup.error?.data?.zodError?.fieldErrors.color?.[0] ||
                  'Error al editar el grupo de etiquetas'
                : ''}
            </p>
          ) : null}

          {conflict && <ModelosConflict modelos={conflict} />}

          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={handleSubmit}
              disabled={submitDisabled}
            >
              {((editTagGroup.isLoading || createTagGroup.isLoading) && (
                <Loader />
              )) ||
                (modalData.type === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.type === 'EDIT' && (
              <Button
                variant='destructive'
                className={cn('h-auto text-wrap', {
                  'bg-red-700 hover:bg-red-500': shouldDelete,
                })}
                onClick={handleDelete}
                disabled={!canDelete}
              >
                {canDelete
                  ? shouldDelete
                    ? '¿Estás seguro?'
                    : 'Eliminar'
                  : 'No se puede eliminar, el grupo contiene etiquetas'}
              </Button>
            )}
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GrupoEtiquetaModal;
