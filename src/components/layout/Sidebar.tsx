import SidebarLink from '@/components/layout/SidebarLink';
import Image from 'next/image';
import React from 'react';
import ModeloIcon from '@/components/icons/ModeloIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import EtiquetaIcon from '@/components/icons/EtiquetasIcon';
import ConfigIcon from '@/components/icons/ConfigIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import HomeFillIcon from '@/components/icons/HomeFillIcon';
import ModeloFillIcon from '@/components/icons/ModeloFillIcon';
import ChatFillIcon from '@/components/icons/ChatFillIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import ConfigFillIcon from '@/components/icons/ConfigFillIcon';
import EventIcon from '@/components/icons/EventIcon';
import EventFillIcon from '@/components/icons/EventFillIcon';

const Sidebar = () => {
  return (
    <div className='hidden w-48 flex-col border-r-[3px] border-black/20 bg-sidebar-background md:flex'>
      <Image
        src='/img/logo.webp'
        className='w-full select-none px-2 pb-10 pt-5'
        alt='Expo Manager'
        width={100}
        height={100}
      />
      <div className='flex-1'>
        <ul className='divide-y-2 divide-black/80'>
          <SidebarLink
            to='/'
            icon={<HomeIcon height={24} width={24} />}
            iconActive={<HomeFillIcon height={24} width={24} />}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink
            to='/modelos'
            icon={<ModeloIcon height={24} width={24} />}
            iconActive={<ModeloFillIcon height={24} width={24} />}
          >
            Modelos
          </SidebarLink>
          <SidebarLink
            to='/mensajes'
            icon={<ChatIcon height={24} width={24} />}
            iconActive={<ChatFillIcon height={24} width={24} />}
          >
            Mensajes
          </SidebarLink>
          <SidebarLink
            to='/etiquetas'
            icon={<EtiquetaIcon height={24} width={24} />}
            iconActive={<EtiquetasFillIcon height={24} width={24} />}
          >
            Etiquetas
          </SidebarLink>
          <SidebarLink
            to='/eventos'
            icon={<EventIcon height={24} width={24} />}
            iconActive={<EventFillIcon height={24} width={24} />}
          >
            Eventos
          </SidebarLink>
        </ul>
      </div>
      <div className='justify-self-end'>
        <SidebarLink
          to='/configuracion'
          icon={<ConfigIcon height={24} width={24} />}
          iconActive={
            <ConfigFillIcon height={24} width={24} className='h-6 w-6' />
          }
          textClassName='text-lg'
        >
          Configuración
        </SidebarLink>
      </div>
    </div>
  );
};

export default Sidebar;
