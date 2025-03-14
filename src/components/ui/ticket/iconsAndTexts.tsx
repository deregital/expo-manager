import { type TicketType } from 'expo-backend-types';
import { type ReactElement } from 'react';
import PopcornIcon from '@/components/icons/PopcornIcon';
import ProfileFillIcon from '@/components/icons/ProfileFillIcon';
import StaffIcon from '@/components/icons/StaffIcon';

export const iconsAndTexts: Record<
  TicketType,
  { icon: ReactElement; text: string }
> = {
  PARTICIPANT: {
    icon: <ProfileFillIcon className='size-6' />,
    text: 'Participante',
  },
  SPECTATOR: {
    icon: <PopcornIcon className='size-6' />,
    text: 'Espectador',
  },
  STAFF: {
    icon: <StaffIcon className='size-6' />,
    text: 'Staff',
  },
};
