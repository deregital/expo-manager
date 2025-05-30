import { type RouterOutputs } from '@/server';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ProfileTagsList from '@/components/modelo/ProfileTagsList';
import { create } from 'zustand';
import CommentsSection from '@/components/modelo/CommentsSection';
import { Button } from '../ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import CircleXIcon from '../icons/CircleX';
import { Save, Trash2Icon } from 'lucide-react';
import CirclePlus from '../icons/CirclePlus';
import ProfilePicture from '@/components/modelo/ProfilePicture';
import ProfileEditModal, {
  ageFromBirthDate as ageFromBirthDate,
} from '@/components/modelo/ProfileEditModal';
import Link from 'next/link';
import ChatFillIcon from '@/components/icons/ChatFillIcon';
import WhatsappIcon from '@/components/icons/WhatsappIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import MailIcon from '@/components/icons/MailIcon';
import DNIIcon from '@/components/icons/DNIIcon';
import TrashCanButtons from '@/components/papelera/BotonesPapelera';
import { type GetByProfileCommentResponseDto } from 'expo-backend-types';
import { type TagWithGroupColor } from '@/server/types/etiquetas';
import { notChoosableTagTypes } from '@/lib/constants';

interface ProfilePageContentProps {
  profile: NonNullable<RouterOutputs['profile']['getById']>;
}
type ProfileData = {
  id: string;
  tags: TagWithGroupColor[];
  comments: GetByProfileCommentResponseDto['comments'] | undefined;
};
type ProfilePicture = {
  id: string;
  pictureUrl: string | undefined;
};
export const useProfileData = create<ProfileData>(() => ({
  id: '',
  tags: [],
  comments: undefined,
}));
export const useProfilePicture = create<ProfilePicture>(() => ({
  id: '',
  pictureUrl: undefined,
}));
const ProfilePageContent = ({ profile }: ProfilePageContentProps) => {
  const { tags } = useProfileData((state) => ({
    tags: state.tags,
  }));
  const [profilePicUrl, setProfilePictureUrl] = useState(
    profile?.profilePictureUrl
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [edit, setEdit] = useState(false);
  const utils = trpc.useUtils();
  const filteredTags = useMemo(
    () => tags.filter((e) => !notChoosableTagTypes.includes(e.type)),
    [tags]
  );

  useEffect(() => {
    setProfilePictureUrl(profile.profilePictureUrl);
  }, [profile]);

  async function handleDelete() {
    const form = new FormData();
    form.append('id', profile.id);
    form.append('url', profilePicUrl ?? '');
    await fetch('/api/image/profile', {
      method: 'DELETE',
      body: form,
    })
      .then(() => {
        toast.success('Foto eliminada con éxito');
        utils.profile.getById.invalidate();
        setProfilePictureUrl(null);
      })
      .catch(() => toast.error('Error al eliminar la foto'));
    setEdit(false);
    inputRef.current!.value = '';
  }
  async function handleUpload() {
    if (!video) {
      toast.error('No se ha seleccionado una imagen');
      return;
    }
    const form = new FormData();
    form.append('imagen', video);
    form.append('id', profile.id);
    form.append('url', profile.profilePictureUrl ?? '');
    toast.loading('Subiendo foto...');
    setEdit(false);
    await fetch('/api/image/profile', {
      method: 'POST',
      body: form,
    })
      .then(() => {
        toast.dismiss();
        if (inputRef.current) {
          inputRef.current!.value = '';
        }
        setEdit(false);
        setVideo(null);
        utils.profile.getById.invalidate();
        toast.success('Foto actualizada con éxito');
      })
      .catch((e) => {
        toast.dismiss();
        toast.error('Error al subir la foto');
        setEdit(false);
        setVideo(null);
        setProfilePictureUrl(profile.profilePictureUrl);
      });
  }

  function handleCancel() {
    setProfilePictureUrl(profile.profilePictureUrl);
    setVideo(null);
    inputRef.current!.value = '';
    setEdit(false);
  }

  return (
    <>
      <div className='mt-4 flex flex-col gap-x-4 sm:flex-row'>
        <div className='relative flex w-full flex-col items-center md:w-[200px]'>
          <ProfilePicture
            onClick={() => {
              setEdit(true);
            }}
            alt={`${profile?.fullName}`}
            src={
              (profilePicUrl === profile.profilePictureUrl && profilePicUrl
                ? `${profilePicUrl}?test=${new Date().getTime()}`
                : profilePicUrl) || '/img/profilePlaceholder.jpg'
            }
          />
          {edit && (
            <>
              <div className='mt-2 flex w-full max-w-[200px] items-center justify-between gap-x-3'>
                <label className='flex aspect-square w-[calc(33%-4px)] max-w-12 items-center justify-center rounded-full border-2 bg-black text-white hover:cursor-pointer md:h-8 md:w-8'>
                  <CirclePlus className='h-8 w-8 md:h-8 md:w-8' />
                  <input
                    type='file'
                    name='imagen'
                    className='hidden'
                    accept='image/jpeg,image/png,image/webp'
                    ref={inputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setVideo(file ?? null);
                      setProfilePictureUrl(
                        !file ? null : URL.createObjectURL(file)
                      );
                    }}
                  />
                </label>
                {inputRef.current?.value && (
                  <>
                    <Button
                      className={`aspect-square h-10 w-[calc(33%-4px)] max-w-10 p-1 text-xs md:h-8 md:w-8`}
                      onClick={handleUpload}
                    >
                      <Save className='h-5 w-5' />
                    </Button>
                  </>
                )}
                {!inputRef.current?.value && profilePicUrl && (
                  <Button
                    className='aspect-square h-10 w-[calc(33%-4px)] max-w-10 bg-red-600 p-1 hover:bg-red-800 md:h-max md:w-8'
                    onClick={handleDelete}
                  >
                    <Trash2Icon className='h-5 w-5' />
                  </Button>
                )}
                <CircleXIcon
                  onClick={handleCancel}
                  className='aspect-square w-[calc(33%-4px)] max-w-12 cursor-pointer md:h-8 md:w-8'
                />
              </div>
              {video && (
                <span className='mt-1 max-w-full truncate'>{video.name}</span>
              )}
            </>
          )}
        </div>
        <div className='mt-2 flex w-full flex-col gap-y-4 sm:mt-0'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-x-4'>
              <h2 className='text-xl font-bold md:text-3xl'>
                {profile?.fullName}
                <span className='ml-2 text-2xl font-bold text-gray-600'>
                  ID: {profile?.shortId}
                </span>
              </h2>
              <Link
                href={`/mensajes/${profile.phoneNumber}`}
                className='rounded-md bg-slate-600 p-2'
                title='Enviar mensaje por chat'
              >
                <ChatFillIcon className='h-4 w-4 fill-white' />
              </Link>
              <a
                className='cursor-pointer rounded-md bg-lime-600 p-2'
                title='Enviar mensaje por WhatsApp'
                href={`https://wa.me/${profile.phoneNumber}`}
                target='_blank'
                rel='noreferrer'
              >
                <WhatsappIcon className='h-4 w-4 fill-white' />
              </a>
              {profile.instagram && (
                <a
                  className='cursor-pointer rounded-md bg-[#c000b3] p-2'
                  title={`Instagram de ${profile.fullName}`}
                  href={`https://instagram.com/${profile.instagram}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <InstagramIcon className='h-4 w-4 fill-white' />
                </a>
              )}
              {profile.mail && (
                <a
                  className='cursor-pointer rounded-md bg-[#ea1c1c] p-2'
                  title={`Mail de ${profile.fullName}`}
                  href={`mailto:${profile.mail}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  <MailIcon className='h-4 w-4 fill-white' />
                </a>
              )}
            </div>
            {profile.dni && (
              <p>
                <DNIIcon className='mr-2 inline-block h-5 w-5 fill-black' />
                <span>{profile.dni}</span>
              </p>
            )}
            {profile.alternativeNames.length > 0 && (
              <p className='text-sm text-black/80'>
                Nombres alternativos: {profile.alternativeNames.join(', ')}
              </p>
            )}
            <div className='flex gap-x-4'>
              <p>
                Edad:{' '}
                {profile.birthDate
                  ? `${ageFromBirthDate(profile.birthDate)} años`
                  : 'N/A'}
              </p>
              <p>Género: {profile?.gender ?? 'N/A'}</p>
              <ProfileEditModal profile={profile} />
            </div>
          </div>
          <div className='hidden flex-wrap gap-2 md:flex'>
            <ProfileTagsList profileId={profile.id} tags={filteredTags} />
          </div>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap gap-2 md:hidden'>
        <ProfileTagsList profileId={profile.id} tags={filteredTags} />
      </div>
      <div className='mt-3 flex flex-col gap-x-2 sm:flex-row sm:items-center'>
        {profile.isInTrash && (
          <span className='order-2 font-bold text-red-500 sm:order-1'>
            La modelo está en la papelera
          </span>
        )}
        <div className='order-1 sm:order-2'>
          <TrashCanButtons id={profile.id} isInTrash={profile.isInTrash} />
        </div>
      </div>
      <div className='mt-5'>
        <h2 className='text-xl font-bold md:text-2xl'>Comentarios</h2>
        <CommentsSection profileId={profile.id} />
      </div>
    </>
  );
};
export default ProfilePageContent;
