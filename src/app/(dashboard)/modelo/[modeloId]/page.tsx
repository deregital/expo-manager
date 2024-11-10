'use client';
import ProfilePageContent, {
  useProfileData,
} from '@/components/modelo/ModeloPageContent';
import Loader from '@/components/ui/loader';
import { trpc } from '@/lib/trpc';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface ModeloPageProps {
  params: {
    modeloId: string;
  };
}

const ModeloPage = ({ params }: ModeloPageProps) => {
  const { data: profile, isLoading: isLoadingProfile } =
    trpc.modelo.getById.useQuery(params.modeloId, {
      enabled: !!params.modeloId,
    });
  const {
    data: comments,
    isLoading: isLoadingComments,
    isRefetching: isRefetchingComments,
  } = trpc.comment.getByProfileId.useQuery(params.modeloId);

  const router = useRouter();

  useEffect(() => {
    if (isRefetchingComments) return;
    if (isLoadingProfile || isLoadingComments) return;

    if (!profile || !comments) return;

    useProfileData.setState({
      id: profile.id,
      tags: profile.tags,
      comments: comments.comments,
    });
  }, [
    profile,
    isLoadingProfile,
    isLoadingComments,
    comments,
    isRefetchingComments,
  ]);

  return (
    <div className='h-full px-4 pt-4'>
      <div className='flex items-center gap-x-4'>
        <ArrowLeft
          className='cursor-pointer'
          onClick={() => {
            router.back();
          }}
        />
      </div>
      {isLoadingProfile || isLoadingComments || !profile || !comments ? (
        <div className='flex h-full w-full items-center justify-center'>
          <Loader />
        </div>
      ) : (
        <ProfilePageContent profile={profile} />
      )}
    </div>
  );
};

export default ModeloPage;
