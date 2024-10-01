import { useModeloData } from '@/components/modelo/ModeloPageContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import React, { FormEvent, useState } from 'react';
import { Switch } from '@/components/ui/switch'; // Asegúrate de tener un componente Switch adecuado
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';

interface ComentariosSectionProps {
  modeloId: string;
}

const ComentariosSection = ({ modeloId }: ComentariosSectionProps) => {
  const createComentario = trpc.comentario.create.useMutation();
  const updateComentario = trpc.comentario.update.useMutation();
  const session = useSession();
  const utils = trpc.useUtils();

  const { comentarios: comentariosData } = useModeloData((state) => ({
    comentarios: state.comentarios,
  }));
  // Estado para manejar el switch de Simple o Resoluble
  const [esResoluble, setEsResoluble] = useState(false);

  const handleResueltoChange = async (
    comentarioId: string,
    isResuelto: boolean
  ) => {
    try {
      toast.loading('Actualizando comentario...');
      await updateComentario.mutateAsync({
        id: comentarioId,
        isSolved: isResuelto,
      });
      utils.comentario.getByPerfilId.invalidate({ perfilId: modeloId });
      toast.success('Comentario actualizado');
    } catch (error) {
      console.error('Error al actualizar el estado del comentario:', error);
      toast.error('Error al actualizar el estado del comentario');
    }
    toast.dismiss();
  };
  async function handleAddComentario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comentario: { value: string };
    };
    const comentario = target.comentario.value;
    const isSolvable = esResoluble;

    if (!comentario || comentario === '') return;
    e.currentTarget.reset();
    setEsResoluble(false);

    useModeloData.setState({
      comentarios: [
        {
          id: 'temp',
          contenido: comentario,
          isSolvable: isSolvable,
          created_at: new Date().toISOString(),
          cuenta: {
            nombreUsuario: session.data?.user?.username as string,
          },
          creadoPor: session.data?.user?.id as string,
          perfilId: modeloId,
          updated_at: new Date().toISOString(),
          isSolved: false,
          solvedAt: null,
          solvedById: null,
        },
        ...(comentariosData || []),
      ],
    });

    createComentario
      .mutateAsync({
        contenido: comentario as string,
        isSolvable: isSolvable,
        perfilId: modeloId,
      })
      .then(() => {
        utils.comentario.getByPerfilId.invalidate({ perfilId: modeloId });
      })
      .catch(() => {
        target.comentario.value = comentario;
        useModeloData.setState({
          comentarios: comentariosData?.filter(
            (comentario) => comentario.id !== 'temp'
          ),
        });
      });
  }

  return (
    <section className='mt-1 flex flex-col gap-y-4'>
      <form
        onSubmit={handleAddComentario}
        className='flex items-end gap-x-4 rounded-lg bg-gray-300 px-3 pb-3 pt-2'
      >
        <Input
          autoComplete='off'
          name='comentario'
          className='flex-grow'
          placeholder='Añadir un comentario'
        />
        <div className='flex flex-col items-center'>
          <span className='mb-1 whitespace-nowrap text-sm'>
            Simple / Resoluble
          </span>
          <Switch checked={esResoluble} onCheckedChange={setEsResoluble} />
        </div>
        <Button disabled={createComentario.isLoading} type='submit'>
          Enviar
        </Button>
      </form>
      {comentariosData?.map((comentario) => (
        <div key={comentario.id} className='my-2 flex flex-col'>
          <div className='flex justify-between'>
            <p className='rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
              {new Date(comentario.created_at).toLocaleString('es-AR')}
            </p>
            <div className='flex items-center justify-center gap-x-2'>
              {comentario.isSolvable && (
                <div className='flex items-center justify-center gap-x-2 rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
                  <Checkbox
                    checked={comentario.isSolved}
                    disabled={session.data?.user?.id !== comentario.creadoPor}
                    onCheckedChange={(checked) => {
                      handleResueltoChange(comentario.id, !!checked);
                    }}
                  />
                  <p className='text-sm'>
                    {comentario.isSolved ? 'Resuelto' : 'No resuelto'}
                  </p>
                </div>
              )}
              <div className='flex items-center justify-center gap-x-2 rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
                <p className=''>{comentario.cuenta.nombreUsuario}</p>
              </div>
            </div>
          </div>
          <div className='rounded-b-lg border-[1px] border-black/50 p-2'>
            <p>{comentario.contenido}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default ComentariosSection;
