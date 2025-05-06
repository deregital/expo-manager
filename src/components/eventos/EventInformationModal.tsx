'use client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef, forwardRef } from 'react';
import React from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import InfoIcon from '@/components/icons/InfoIcon';
import { Trash2Icon } from 'lucide-react';

interface EventInformationModalProps {
  event: RouterOutputs['event']['getAll']['withoutFolder'][number];
}
const uploadImage = async (url: string, file: File | null, id: string) => {
  if (!file) {
    toast.error('No se ha seleccionado una imagen');
    return;
  }

  const form = new FormData();
  form.append('imagen', file);
  form.append('id', id);
  return fetch(url, { method: 'POST', body: form });
};

const deleteImage = async (url: string, id: string) => {
  const form = new FormData();
  form.append('id', id);
  return fetch(url, { method: 'DELETE', body: form });
};

const EventInformationModal = ({ event }: EventInformationModalProps) => {
  // Estados para manejar la descripción y las imágenes
  const [description, setDescription] = useState(event.description || '');
  const [mainPicture, setMainPicture] = useState<File | null>(null);
  const [bannerPicture, setBannerPicture] = useState<File | null>(null);
  const [mainPicturePreview, setMainPicturePreview] = useState<string | null>(
    event.mainPictureUrl
  );
  const [bannerPicturePreview, setBannerPicturePreview] = useState<
    string | null
  >(event.bannerUrl);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Referencias para los inputs de archivos
  const mainPictureInputRef = useRef<HTMLInputElement>(null);
  const bannerPictureInputRef = useRef<HTMLInputElement>(null);

  // Función para resetear los estados del formulario
  const resetFormStates = () => {
    setDescription(event.description || '');
    setMainPicture(null);
    setBannerPicture(null);
    setMainPicturePreview(event.mainPictureUrl);
    setBannerPicturePreview(event.bannerUrl);

    // Resetear los valores de los inputs de archivo
    if (mainPictureInputRef.current) {
      mainPictureInputRef.current.value = '';
    }
    if (bannerPictureInputRef.current) {
      bannerPictureInputRef.current.value = '';
    }
  };

  const updateEvent = trpc.event.update.useMutation();

  const utils = trpc.useUtils();

  const handleMainPictureUpload = async () => {
    setIsLoading(true);
    await uploadImage('/api/image/event-picture', mainPicture, event.id)
      .catch(() => {
        toast.error('Error al subir la foto principal');
      })
      .then(() => {
        toast.success('Foto principal actualizada con éxito');
        utils.event.getById.invalidate(event.id);
        utils.event.getAll.invalidate();
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleBannerPictureUpload = async () => {
    setIsLoading(true);
    await uploadImage('/api/image/event-banner', bannerPicture, event.id)
      .then(() => {
        toast.success('Banner actualizado con éxito');
        utils.event.getById.invalidate(event.id);
        utils.event.getAll.invalidate();
      })
      .catch(() => {
        toast.error('Error al subir el banner');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDescriptionUpdate = async () => {
    setIsLoading(true);
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        description: description !== '' ? description : null,
      });
      toast.success('Descripción actualizada con éxito');
      utils.event.getById.invalidate(event.id);
      utils.event.getAll.invalidate();
    } catch {
      toast.error('Error al actualizar la descripción');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (description !== (event.description || '')) {
        await handleDescriptionUpdate();
      }

      if (mainPicture) {
        await handleMainPictureUpload();
      }

      if (bannerPicture) {
        await handleBannerPictureUpload();
      }

      setOpen(false);
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMainPicture = async () => {
    if (!event.mainPictureUrl) return;

    setIsLoading(true);

    await deleteImage('/api/image/event-picture', event.id)
      .then(() => {
        toast.success('Foto principal eliminada con éxito');
        setMainPicturePreview(null);
        setMainPicture(null);
        if (mainPictureInputRef.current) {
          mainPictureInputRef.current.value = '';
        }
        utils.event.getById.invalidate(event.id);
        utils.event.getAll.invalidate();
      })
      .catch(() => {
        toast.error('Error al eliminar la foto principal');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteBanner = async () => {
    if (!event.bannerUrl && bannerPicture === null) return;
    if (bannerPicture) {
      setBannerPicture(null);
      setBannerPicturePreview(null);
      if (bannerPictureInputRef.current) {
        bannerPictureInputRef.current.value = '';
      }
      setBannerPicturePreview(event.bannerUrl || null);
      return;
    }
    setIsLoading(true);

    await deleteImage('/api/image/event-banner', event.id)
      .then(() => {
        toast.success('Banner eliminado con éxito');
        setBannerPicturePreview(null);
        setBannerPicture(null);
        if (bannerPictureInputRef.current) {
          bannerPictureInputRef.current.value = '';
        }
        utils.event.getById.invalidate(event.id);
        utils.event.getAll.invalidate();
      })
      .catch(() => {
        toast.error('Error al eliminar el banner');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDeleteData = async () => {
    setIsLoading(true);
    try {
      if (event.mainPictureUrl) {
        await handleDeleteMainPicture();
      }

      if (event.bannerUrl) {
        await handleDeleteBanner();
      }

      await updateEvent.mutateAsync({
        id: event.id,
        description: null,
        mainPictureUrl: null,
        bannerUrl: null,
      });
      resetFormStates();

      toast.success('Datos eliminados con éxito');
    } catch {
      toast.error('Error al eliminar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpenState: boolean) => {
    setOpen(newOpenState);

    if (!newOpenState) {
      resetFormStates();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <InfoIcon
          ref={null}
          className='h-5 w-5 cursor-pointer hover:text-black'
        />
      </DialogTrigger>
      <DialogContent className='mx-2 flex w-full flex-col gap-y-3 rounded-md bg-slate-100 px-6 py-4 md:max-w-4xl'>
        <h2 className='text-xl font-bold'>
          Agregar información sobre el evento
        </h2>

        {/* Descripción del evento */}
        <div className='flex flex-col gap-y-2'>
          <label htmlFor='description' className='font-medium'>
            Descripción del evento
          </label>
          <Textarea
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Descripción del evento...'
            className='min-h-[150px]'
          />
        </div>

        {/* Sección de imágenes */}
        <div className='flex flex-row items-start justify-start gap-x-4'>
          {/* Foto del evento */}
          <EventImageInput
            label='Foto del evento'
            inputId='mainPictureInput'
            previewUrl={mainPicturePreview}
            file={mainPicture}
            onFileChange={(file) => {
              setMainPicture(file);
              setMainPicturePreview(URL.createObjectURL(file));
            }}
            onDelete={handleDeleteMainPicture}
            isLoading={isLoading}
            inputRef={mainPictureInputRef}
          />

          {/* Foto banner */}
          <EventImageInput
            label='Banner del evento'
            inputId='bannerPictureInput'
            previewUrl={bannerPicturePreview}
            file={bannerPicture}
            onFileChange={(file) => {
              setBannerPicture(file);
              setBannerPicturePreview(URL.createObjectURL(file));
            }}
            onDelete={handleDeleteBanner}
            isLoading={isLoading}
            inputRef={bannerPictureInputRef}
          />
        </div>

        {/* Botones */}
        <div className='mt-4 flex justify-between'>
          <Button
            variant='destructive'
            onClick={handleDeleteData}
            disabled={isLoading}
            className='flex items-center gap-x-2'
          >
            <Trash2Icon className='h-4 w-4' />
            Borrar datos actuales
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventInformationModal;

interface EventImageInputProps {
  label: string;
  inputId: string;
  previewUrl: string | null;
  file: File | null;
  onFileChange: (file: File) => void;
  onDelete: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

const EventImageInput = forwardRef<HTMLInputElement, EventImageInputProps>(
  (
    { label, inputId, previewUrl, file, onFileChange, onDelete, isLoading },
    ref
  ) => (
    <div className='flex flex-1 flex-col items-start'>
      <label htmlFor={inputId} className='block font-medium'>
        {label}
      </label>
      <div className='mt-2 flex items-center gap-x-2'>
        <label
          htmlFor={inputId}
          className='flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent'
        >
          {file ? file.name : 'Subir archivo'}
          <input
            id={inputId}
            type='file'
            className='hidden'
            accept='image/jpeg,image/png,image/webp'
            ref={ref}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }}
          />
        </label>
        {previewUrl && (
          <Button
            variant='destructive'
            size='icon'
            onClick={onDelete}
            disabled={isLoading}
          >
            <Trash2Icon className='h-4 w-4' />
          </Button>
        )}
      </div>
      {previewUrl && (
        <div className='mt-2'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${previewUrl}?${new Date().getTime()}`}
            alt={`Vista previa de ${label}`}
            className='max-h-40 w-full rounded-md object-cover'
          />
        </div>
      )}
    </div>
  )
);

// 👇 Nombre útil para debugging
EventImageInput.displayName = 'EventImageInput';
