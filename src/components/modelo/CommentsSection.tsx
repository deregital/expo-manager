import { useProfileData } from '@/components/modelo/ProfilePageContent';
import { trpc } from '@/lib/trpc';
import { useSession } from 'next-auth/react';
import React, { FormEvent, useState } from 'react';
// Asegúrate de tener un componente Switch adecuado
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import CreateComment from './CreateComment';
import { GetByProfileCommentResponseDto } from 'expo-backend-types';

interface CommentsSectionProps {
  profileId: string;
}

const CommentsSection = ({ profileId }: CommentsSectionProps) => {
  const createComment = trpc.comment.create.useMutation();
  const updateComment = trpc.comment.toggleSolve.useMutation();
  const session = useSession();
  const utils = trpc.useUtils();

  const { comments: commentsData } = useProfileData((state) => ({
    comments: state.comments,
  }));
  // Estado para manejar el switch de Simple o Resoluble
  const [isSolvable, setIsSolvable] = useState(false);

  const handleResueltoChange = async (commentId: string) => {
    try {
      toast.loading('Actualizando comentario...');
      await updateComment.mutateAsync(commentId);
      utils.comment.getByProfileId.invalidate(profileId);
      toast.success('Comentario actualizado');
    } catch (error) {
      console.error('Error al actualizar el estado del comentario:', error);
      toast.error(error as string);
    }
    toast.dismiss();
  };
  async function handleAddComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      comment: { value: string };
    };
    const commentContent = target.comment.value;
    const isSolvableComment = isSolvable;

    if (!commentContent || commentContent === '') return;
    e.currentTarget.reset();
    setIsSolvable(false);

    useProfileData.setState({
      comments: [
        {
          id: 'temp',
          content: commentContent,
          isSolvable: isSolvableComment,
          created_at: new Date().toISOString(),
          account: {
            username: session.data?.user?.username as string,
          },
          createdBy: session.data?.user?.id as string,
          profileId: profileId,
          updated_at: new Date().toISOString(),
          isSolved: false,
          solvedAt: null,
          solvedBy: undefined,
        },
        ...(commentsData || []),
      ],
    });

    createComment
      .mutateAsync({
        content: commentContent as string,
        isSolvable: isSolvableComment,
        profileId: profileId,
      })
      .then(() => {
        utils.comment.getByProfileId.invalidate(profileId);
      })
      .catch(() => {
        target.comment.value = commentContent;
        useProfileData.setState({
          comments: commentsData?.filter((comment) => comment.id !== 'temp'),
        });
      });
  }

  return (
    <section className='mt-1 flex flex-col gap-y-4'>
      <CreateComment
        handleAddComment={handleAddComment}
        isSolvable={isSolvable}
        setIsSolvable={setIsSolvable}
        createComment={createComment}
        textSubmit='Enviar'
      />
      {commentsData?.map(
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

export default CommentsSection;
