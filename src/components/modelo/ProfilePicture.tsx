import React from 'react';

interface ProfilePictureProps {
  onClick: () => void;
  src: string;
  alt: string;
}

const ProfilePicture = ({ onClick, alt, src }: ProfilePictureProps) => {
  return (
    <div
      onClick={onClick}
      className='group relative aspect-square w-full max-w-[200px] select-none rounded-lg hover:cursor-pointer md:w-[200px]'
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        width={150}
        height={150}
        alt={alt}
        className={`absolute left-0 top-0 h-full w-full rounded-lg object-fill`}
      />
      <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-lg bg-black/60 opacity-0 transition duration-300 ease-in-out group-hover:opacity-100'>
        <p className='select-none text-lg font-bold text-white'>EDITAR</p>
      </div>
    </div>
  );
};

export default ProfilePicture;
