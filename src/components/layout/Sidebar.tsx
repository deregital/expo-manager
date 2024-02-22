import SidebarLink from '@/components/layout/SidebarLink';
import Image from 'next/image';
import React from 'react';
import { HomeIcon } from 'lucide-react';
import ModeloIcon from '@/components/icons/ModeloIcon';
import ChatIcon from '@/components/icons/ChatIcon';
import EtiquetaIcon from '@/components/icons/EtiquetaIcon';

const Sidebar = () => {
  return (
    <div className="flex w-48 flex-col bg-blue-500">
      <Image
        src="/img/logo.webp"
        className="w-full select-none px-2 pb-10 pt-5"
        alt="Expo Manager"
        width={100}
        height={100}
      />
      <div className="flex-1">
        <ul className="divide-y-2 divide-black/80">
          <SidebarLink
            to="/dashboard"
            icon={<HomeIcon height={24} width={24} />}
          >
            Dashboard
          </SidebarLink>
          <SidebarLink
            to="/modelos"
            icon={<ModeloIcon height={24} width={24} />}
          >
            Modelos
          </SidebarLink>
          <SidebarLink
            to="/mensajes"
            icon={<ChatIcon height={24} width={24} />}
          >
            Mensajes
          </SidebarLink>
          <SidebarLink
            to="/etiquetas"
            icon={<EtiquetaIcon height={24} width={24} />}
          >
            Etiquetas
          </SidebarLink>
        </ul>
      </div>
      <div className="justify-self-end">
        <p>Configuración</p>
      </div>
    </div>
  );
};

export default Sidebar;
