import { useModeloData } from '@/components/modelo/ModeloPageContent';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import React, { FormEvent, useState } from 'react';
// Asegúrate de tener un componente Switch adecuado
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import CrearComentario from './CrearComentario';
import { GetByProfileCommentResponseDto } from 'expo-backend-types';

interface ComentariosSectionProps {
  modeloId: string;
}

const ComentariosSection = ({ modeloId }: ComentariosSectionProps) => {
  const createComment = trpc.comment.create.useMutation();
  const updateComment = trpc.comment.toggleSolve.useMutation();
  const session = useSession();
  const utils = trpc.useUtils();

  const { comentarios: comentariosData } = useModeloData((state) => ({
    comentarios: state.comentarios,
  }));
  // Estado para manejar el switch de Simple o Resoluble
  const [esResoluble, setEsResoluble] = useState(false);

  const handleResueltoChange = async (commentId: string) => {
    try {
      toast.loading('Actualizando comentario...');
      await updateComment.mutateAsync({
        id: commentId,
      });
      utils.comment.getById.invalidate(modeloId);
      toast.success('Comentario actualizado');
    } catch (error) {
      console.error('Error al actualizar el estado del comentario:', error);
      toast.error(error as string);
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
          content: comentario,
          isSolvable: isSolvable,
          created_at: new Date().toISOString(),
          account: {
            username: session.data?.user?.username as string,
          },
          createdBy: session.data?.user?.id as string,
          profileId: modeloId,
          updated_at: new Date().toISOString(),
          isSolved: false,
          solvedAt: null,
          solvedBy: undefined,
        },
        ...(comentariosData || []),
      ],
    });

    createComment
      .mutateAsync({
        content: comentario as string,
        isSolvable: isSolvable,
        profileId: modeloId,
      })
      .then(() => {
        utils.comment.getById.invalidate(modeloId);
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
      <CrearComentario
        handleAddComment={handleAddComentario}
        isSolvable={esResoluble}
        setIsSolvable={setEsResoluble}
        createComment={createComment}
        textSubmit='Enviar'
      />
      {comentariosData?.map(
        (comment: GetByProfileCommentResponseDto['comments'][number]) => (
          <div key={comment.id} className='my-2 flex flex-col'>
            <div className='flex justify-between'>
              <p className='rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
                {new Date(comment.created_at).toLocaleString('es-AR')}
              </p>
              <div className='flex items-center justify-center gap-x-2'>
                {comment.isSolvable && (
                  <div className='flex items-center justify-center gap-x-2 rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
                    <Checkbox
                      checked={comment.isSolved}
                      disabled={
                        !session.data?.user?.esAdmin &&
                        session.data?.user?.id !== comment.createdBy
                      }
                      onCheckedChange={() => {
                        handleResueltoChange(comment.id);
                      }}
                    />
                    <p className='text-sm'>
                      {comment.isSolved ? 'Resuelto' : 'No resuelto'}
                    </p>
                  </div>
                )}
                <div className='flex items-center justify-center gap-x-2 rounded-t-lg border-[1px] border-b-0 border-black/50 bg-zinc-200 p-2 text-sm'>
                  <p className=''>{comment.account.username}</p>
                </div>
              </div>
            </div>
            <div className='rounded-b-lg border-[1px] border-black/50 p-2'>
              <p>{comment.content}</p>
            </div>
          </div>
        )
      )}
    </section>
  );
};

export default ComentariosSection;
