import { useModeloData } from '@/components/modelo/ModeloPageContent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import React, { FormEvent } from 'react';

interface ComentariosSectionProps {
  modeloId: string;
}
const ComentariosSection = ({ modeloId }: ComentariosSectionProps) => {
  const createComentario = trpc.comentario.create.useMutation();
  const session = useSession();

  const utils = trpc.useUtils();

  const { comentarios: comentariosData } = useModeloData((state) => ({
    comentarios: state.comentarios,
  }));

  async function handleAddComentario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comentario: { value: string };
    };
    const comentario = target.comentario.value;

    if (!comentario || comentario === '') return;
    e.currentTarget.reset();

    useModeloData.setState({
      comentarios: [
        {
          id: 'temp',
          contenido: comentario,
          created_at: new Date().toISOString(),
          cuenta: {
            nombreUsuario: session.data?.user?.username as string,
          },
          creadoPor: session.data?.user?.id as string,
          perfilId: modeloId,
          updated_at: new Date().toISOString(),
        },
        ...(comentariosData || []),
      ],
    });

    createComentario
      .mutateAsync({
        contenido: comentario as string,
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
    <section className='flex flex-col gap-y-4'>
      <form onSubmit={handleAddComentario} className='flex gap-x-4'>
        <Input
          autoComplete='off'
          name='comentario'
          className=''
          placeholder='Añadir un comentario'
        />
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
            <p className='rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
              {comentario.cuenta.nombreUsuario}
            </p>
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
