'use client';
import { trpc } from '@/lib/trpc';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ModalTriggerCreate,
  ModalTriggerEdit,
} from '@/components/etiquetas/modal/ModalTrigger';
import EditFillIcon from '@/components/icons/EditFillIcon';
import Loader from '@/components/ui/loader';
import { cn } from '@/lib/utils';
import { type TagDto } from 'expo-backend-types';
import { create } from 'zustand';
import { toast } from 'sonner';

interface RoleModalProps {
  action: 'CREATE' | 'EDIT';
  role?: TagDto;
  refetchRoles: () => {};
}

type ModalData = {
  type: 'CREATE' | 'EDIT';
  name: string;
  roleId: string;
};

export const useRoleModalData = create<ModalData>(() => ({
  type: 'CREATE',
  name: '',
  roleId: '',
}));

const RoleModal = ({ action, role, refetchRoles }: RoleModalProps) => {
  const [open, setOpen] = useState(false);
  const [shouldDelete, setShouldDelete] = useState(false);
  const utils = trpc.useUtils();
  const modalData = useRoleModalData((state) => ({
    roleId: state.roleId,
    type: state.type,
    name: state.name,
  }));

  const createRole = trpc.role.create.useMutation();
  const editRole = trpc.role.update.useMutation();
  const deleteRole = trpc.role.delete.useMutation();

  async function submit() {
    if (action === 'CREATE') {
      await createRole
        .mutateAsync({ name: modalData.name })
        .then(() => {
          setOpen(!open);
          refetchRoles();
          setShouldDelete(false);
          utils.tag.getByNombre.invalidate();
          toast.success('Rol creado con éxito');
        })
        .catch((error) => {
          toast.error('Error al crear el rol');
        });
    } else if (action === 'EDIT') {
      await editRole
        .mutateAsync({ input: { name: modalData.name }, id: modalData.roleId })
        .then(() => {
          setOpen(!open);
          refetchRoles();
          setShouldDelete(false);
          utils.tag.getByNombre.invalidate();
          toast.success('Rol editado con éxito');
        })
        .catch((error) => {
          toast.error('Error al editar el rol');
        });
    }
  }

  async function handleCancel() {
    createRole.reset();
    editRole.reset();
  }

  async function handleDelete() {
    if (shouldDelete) {
      await deleteRole
        .mutateAsync(modalData.roleId)
        .then(() => {
          setOpen(!open);
          refetchRoles();
          setShouldDelete(false);
          toast.success('Rol eliminado con éxito');
        })
        .catch((error) => {
          toast.error('Error al eliminar el rol');
        });
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
                }}
              >
                Crear rol
              </ModalTriggerCreate>
            ) : (
              <ModalTriggerEdit
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(true);

                  useRoleModalData.setState({
                    type: 'EDIT',
                    roleId: role?.id ?? '',
                    name: role?.name ?? '',
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
              {(action === 'CREATE' && 'Crear rol') ||
                (action === 'EDIT' && 'Editar rol')}
            </p>
            <div className='flex gap-x-3'>
              <Input
                className='bg-white text-black'
                type='text'
                name='rol'
                id='rol'
                placeholder='Nombre del rol'
                value={modalData.name}
                onChange={(e) =>
                  useRoleModalData.setState({ name: e.target.value })
                }
              />
            </div>
          </div>
          {createRole.isError || editRole.isError ? (
            <p className='text-sm font-semibold text-red-500'>
              {createRole.isError
                ? createRole.error?.data?.zodError?.fieldErrors.name?.[0] ||
                  createRole.error.message ||
                  'Error al crear el rol, asegúrese de poner un nombre único'
                : ''}
              {editRole.isError
                ? editRole.error?.data?.zodError?.fieldErrors.input?.[0] ||
                  editRole.error.message ||
                  'Error al editar el rol'
                : ''}
            </p>
          ) : null}
          {deleteRole.isError && (
            <p className='text-sm font-semibold text-red-500'>
              {deleteRole.isError
                ? deleteRole.error?.data?.zodError?.fieldErrors.input?.[0] ||
                  deleteRole.error.message ||
                  'Error al eliminar el rol'
                : ''}
            </p>
          )}
          <div className='flex gap-x-4'>
            <Button
              className='w-full max-w-32'
              onClick={submit}
              disabled={editRole.isLoading || createRole.isLoading}
            >
              {((editRole.isLoading || createRole.isLoading) && <Loader />) ||
                (action === 'CREATE' ? 'Crear' : 'Editar')}
            </Button>
            {action === 'EDIT' && (
              <>
                <Button
                  variant='destructive'
                  className={cn('h-auto text-wrap', {
                    'bg-red-700 hover:bg-red-500': shouldDelete,
                  })}
                  onClick={handleDelete}
                >
                  {shouldDelete ? '¿Estás seguro?' : 'Eliminar'}
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

export default RoleModal;
