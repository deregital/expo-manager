'use client';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { type RouterOutputs } from '@/server';
import InfoIcon from '@/components/icons/InfoIcon';
import { Trash2Icon } from 'lucide-react';

interface EventInformationModalProps {
  event: RouterOutputs['event']['getAll']['withoutFolder'][number];
}

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
    if (!mainPicture) {
      toast.error('No se ha seleccionado una imagen');
      return;
    }

    setIsLoading(true);
    const form = new FormData();
    form.append('imagen', mainPicture);
    form.append('id', event.id);

    try {
      await fetch('/api/image/event-picture', {
        method: 'POST',
        body: form,
      });
      toast.success('Foto principal actualizada con éxito');
      utils.event.getById.invalidate(event.id);
      utils.event.getAll.invalidate();
    } catch (error) {
      toast.error('Error al subir la foto principal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerPictureUpload = async () => {
    if (!bannerPicture) {
      toast.error('No se ha seleccionado una imagen');
      return;
    }

    setIsLoading(true);
    const form = new FormData();
    form.append('imagen', bannerPicture);
    form.append('id', event.id);

    try {
      await fetch('/api/image/event-banner', {
        method: 'POST',
        body: form,
      });
      toast.success('Banner actualizado con éxito');
      utils.event.getById.invalidate(event.id);
      utils.event.getAll.invalidate();
    } catch (error) {
      toast.error('Error al subir el banner');
    } finally {
      setIsLoading(false);
    }
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMainPicture = async () => {
    if (!event.mainPictureUrl) return;

    setIsLoading(true);
    const form = new FormData();
    form.append('id', event.id);

    try {
      await fetch('/api/image/event-picture', {
        method: 'DELETE',
        body: form,
      });
      toast.success('Foto principal eliminada con éxito');
      setMainPicturePreview(null);
      setMainPicture(null);
      if (mainPictureInputRef.current) {
        mainPictureInputRef.current.value = '';
      }
      utils.event.getById.invalidate(event.id);
      utils.event.getAll.invalidate();
    } catch (error) {
      toast.error('Error al eliminar la foto principal');
    } finally {
      setIsLoading(false);
    }
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
    const form = new FormData();
    form.append('id', event.id);

    try {
      await fetch('/api/image/event-banner', {
        method: 'DELETE',
        body: form,
      });
      toast.success('Banner eliminado con éxito');
      setBannerPicturePreview(null);
      setBannerPicture(null);
      if (bannerPictureInputRef.current) {
        bannerPictureInputRef.current.value = '';
      }
      utils.event.getById.invalidate(event.id);
      utils.event.getAll.invalidate();
    } catch (error) {
      toast.error('Error al eliminar el banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setIsLoading(true);
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        description: null,
        date: new Date(event.date),
        location: event.location,
        name: event.name,
        startingDate: new Date(event.startingDate),
        endingDate: new Date(event.endingDate),
        tagsId: event.tags.map((tag) => tag.id),
        folderId: event.folderId,
        mainPictureUrl: event.mainPictureUrl,
        bannerUrl: event.bannerUrl,
        subEvents: event.subEvents.map((subEvent) => ({
          ...subEvent,
          date: new Date(subEvent.date),
          startingDate: new Date(subEvent.startingDate),
          endingDate: new Date(subEvent.endingDate),
        })),
        eventTickets: event.eventTickets.map((ticket) => ({
          amount: ticket.amount,
          price: ticket.price,
          type: ticket.type,
        })),
      });

      if (event.mainPictureUrl) {
        await handleDeleteMainPicture();
      }

      if (event.bannerUrl) {
        await handleDeleteBanner();
      }

      resetFormStates();

      toast.success('Datos eliminados con éxito');
    } catch (error) {
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
        <InfoIcon className='h-5 w-5 cursor-pointer hover:text-black' />
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
          <div className='flex flex-1 flex-col items-start'>
            <label htmlFor='mainPicture' className='block font-medium'>
              Foto del evento
            </label>
            <div className='mt-2 flex items-center gap-x-2'>
              <label
                htmlFor='mainPictureInput'
                className='flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent'
              >
                {mainPicture ? mainPicture.name : 'Subir archivo'}
                <input
                  id='mainPictureInput'
                  type='file'
                  className='hidden'
                  accept='image/jpeg,image/png,image/webp'
                  ref={mainPictureInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMainPicture(file);
                      setMainPicturePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {mainPicturePreview && (
                <Button
                  variant='destructive'
                  size='icon'
                  onClick={handleDeleteMainPicture}
                  disabled={isLoading}
                >
                  <Trash2Icon className='h-4 w-4' />
                </Button>
              )}
            </div>
            {mainPicturePreview && (
              <div className='mt-2'>
                <img
                  src={mainPicturePreview}
                  alt='Vista previa de la foto del evento'
                  className='max-h-40 w-full rounded-md object-cover'
                />
              </div>
            )}
          </div>

          {/* Foto banner */}
          <div className='flex flex-1 flex-col items-start'>
            <label htmlFor='bannerPicture' className='block font-medium'>
              Foto banner
            </label>
            <div className='mt-2 flex items-center gap-x-2'>
              <label
                htmlFor='bannerPictureInput'
                className='flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent'
              >
                {bannerPicture ? bannerPicture.name : 'Subir archivo'}
                <input
                  id='bannerPictureInput'
                  type='file'
                  className='hidden'
                  accept='image/jpeg,image/png,image/webp'
                  ref={bannerPictureInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setBannerPicture(file);
                      setBannerPicturePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
              {bannerPicturePreview && (
                <Button
                  variant='destructive'
                  size='icon'
                  onClick={handleDeleteBanner}
                  disabled={isLoading}
                >
                  <Trash2Icon className='h-4 w-4' />
                </Button>
              )}
            </div>
            {bannerPicturePreview && (
              <div className='mt-2'>
                <img
                  src={bannerPicturePreview}
                  alt='Vista previa del banner del evento'
                  className='max-h-40 w-full rounded-md object-contain'
                />
              </div>
            )}
          </div>
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
