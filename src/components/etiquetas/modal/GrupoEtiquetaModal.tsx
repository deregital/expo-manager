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

interface GrupoEtiquetaModalProps {
  action: 'EDIT' | 'CREATE';
  group?: GrupoConMatch;
}

type GrupoEtiquetaModalData = {
  tipo: 'CREATE' | 'EDIT';
  nombre: string;
  grupoId: string;
  color: string;
  esExclusivo: boolean;
};

export const useGrupoEtiquetaModalData = create<GrupoEtiquetaModalData>(() => ({
  tipo: 'CREATE',
  nombre: '',
  grupoId: '',
  color: '',
  esExclusivo: false,
}));

const GrupoEtiquetaModal = ({ action, group }: GrupoEtiquetaModalProps) => {
  const [open, setOpen] = useState(false);
  const [quiereEliminar, setQuiereEliminar] = useState(false);
  const [conflict, setConflict] = useState<
    RouterOutputs['modelo']['getByGrupoEtiqueta'] | undefined
  >(undefined);
  const utils = trpc.useUtils();
  const createGrupoEtiqueta = trpc.grupoEtiqueta.create.useMutation();
  const editGrupoEtiqueta = trpc.grupoEtiqueta.edit.useMutation();
  const deleteGrupoEtiqueta = trpc.grupoEtiqueta.delete.useMutation();

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

  const modalData = useGrupoEtiquetaModalData((state) => ({
    tipo: state.tipo,
    nombre: state.nombre,
    grupoId: state.grupoId,
    color: state.color,
    esExclusivo: state.esExclusivo,
  }));

  const puedeEliminar = group?._count.tags === 0;

  async function handleCancel() {
    useGrupoEtiquetaModalData.setState({
      tipo: 'CREATE',
      nombre: '',
      grupoId: '',
      color: randomColor(),
      esExclusivo: false,
    });
    createGrupoEtiqueta.reset();
    editGrupoEtiqueta.reset();
  }

  async function handleSubmit() {
    const { tipo, nombre, grupoId, color, esExclusivo } =
      useGrupoEtiquetaModalData.getState();
    if (tipo === 'CREATE') {
      await createGrupoEtiqueta
        .mutateAsync({
          name: nombre,
          color: color,
          isExclusive: esExclusivo,
        })
        .then(() => {
          setOpen(false);
          utils.grupoEtiqueta.getAll.invalidate();
          toast.success('Grupo de etiquetas creado con éxito');
        })
        .catch((e) => {
          setOpen(true);
          toast.error(
            'Error al crear el grupo de etiquetas, asegúrese de poner un nombre y un color'
          );
        });
    } else if (tipo === 'EDIT') {
      if (esExclusivo === true && group?.isExclusive === false) {
        const conflict =
          modelosGrupo &&
          modelosGrupo
            .filter(
              (modelo) =>
                modelo.etiquetas.filter(
                  (etiqueta) => etiqueta.grupoId === grupoId
                ).length > 1
            )
            .map((modelo) => ({
              ...modelo,
              etiquetas: modelo.etiquetas.filter(
                (etiqueta) => etiqueta.grupoId === grupoId
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

      await editGrupoEtiqueta
        .mutateAsync({
          id: grupoId,
          nombre: nombre,
          color: color,
          esExclusivo: esExclusivo,
        })
        .then(() => {
          setOpen(false);
          utils.grupoEtiqueta.getAll.invalidate();
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

    if (createGrupoEtiqueta.isSuccess || editGrupoEtiqueta.isSuccess) {
      useGrupoEtiquetaModalData.setState({
        tipo: 'CREATE',
        nombre: '',
        grupoId: '',
        color: randomColor(),
        esExclusivo: false,
      });
    }

    utils.etiqueta.getByNombre.invalidate();
  }

  async function handleDelete() {
    if (quiereEliminar) {
      await deleteGrupoEtiqueta
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
      setQuiereEliminar(true);
    }
  }

  const submitDisabled = useMemo(() => {
    if (modalData.tipo === 'CREATE') {
      return createGrupoEtiqueta.isLoading || conflict !== undefined;
    } else {
      return (
        editGrupoEtiqueta.isLoading ||
        conflict !== undefined ||
        modelosGrupoLoading
      );
    }
  }, [
    conflict,
    createGrupoEtiqueta.isLoading,
    editGrupoEtiqueta.isLoading,
    modalData.tipo,
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
                useGrupoEtiquetaModalData.setState({
                  tipo: 'CREATE',
                  nombre: '',
                  grupoId: '',
                  color: randomColor(),
                  esExclusivo: false,
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
                useGrupoEtiquetaModalData.setState({
                  tipo: 'EDIT',
                  grupoId: group?.id ?? '',
                  nombre: group?.name ?? '',
                  color: group?.color ?? '',
                  esExclusivo: group?.isExclusive ?? false,
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
              {(modalData.tipo === 'CREATE' && 'Crear grupo de etiquetas') ||
                (modalData.tipo === 'EDIT' && 'Editar grupo de etiquetas')}
            </p>
            <div className='relative flex items-center gap-x-2'>
              <Input
                type='text'
                name='grupo'
                id='grupo'
                placeholder='Nombre del grupo'
                value={modalData.nombre}
                onChange={(e) => {
                  useGrupoEtiquetaModalData.setState({
                    nombre: e.target.value,
                  });
                }}
              />
              <div className='flex items-center gap-x-2'>
                {modalData.esExclusivo ? (
                  <LockIcon
                    onClick={() => {
                      useGrupoEtiquetaModalData.setState({
                        esExclusivo:
                          !useGrupoEtiquetaModalData.getState().esExclusivo,
                      });
                    }}
                    className={cn('h-6 w-6 hover:cursor-pointer')}
                  />
                ) : (
                  <UnlockIcon
                    onClick={() => {
                      useGrupoEtiquetaModalData.setState({
                        esExclusivo:
                          !useGrupoEtiquetaModalData.getState().esExclusivo,
                      });
                    }}
                    className={cn('h-6 w-6 hover:cursor-pointer')}
                  />
                )}

                <ColorPicker
                  color={modalData.color}
                  setColor={(color) => {
                    useGrupoEtiquetaModalData.setState({
                      color: color,
                    });
                  }}
                />
              </div>
            </div>
          </div>
          {createGrupoEtiqueta.isError || editGrupoEtiqueta.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createGrupoEtiqueta.isError
                ? createGrupoEtiqueta.error?.data?.zodError?.fieldErrors
                    .nombre?.[0] ||
                  createGrupoEtiqueta.error?.data?.zodError?.fieldErrors
                    .color?.[0] ||
                  'Error al crear el grupo, asegúrese de poner un nombre y un color'
                : ''}
              {editGrupoEtiqueta.isError
                ? editGrupoEtiqueta.error?.data?.zodError?.fieldErrors
                    .nombre?.[0] ||
                  editGrupoEtiqueta.error?.data?.zodError?.fieldErrors
                    .color?.[0] ||
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
              {((editGrupoEtiqueta.isLoading ||
                createGrupoEtiqueta.isLoading) && <Loader />) ||
                (modalData.tipo === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {modalData.tipo === 'EDIT' && (
              <Button
                variant='destructive'
                className={cn('h-auto text-wrap', {
                  'bg-red-700 hover:bg-red-500': quiereEliminar,
                })}
                onClick={handleDelete}
                disabled={!puedeEliminar}
              >
                {puedeEliminar
                  ? quiereEliminar
                    ? '¿Estás seguro?'
                    : 'Eliminar'
                  : 'No se puede eliminar, el grupo contiene etiquetas'}
              </Button>
            )}
            {quiereEliminar && (
              <Button
                variant='secondary'
                onClick={() => {
                  setQuiereEliminar(false);
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
