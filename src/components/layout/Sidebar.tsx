import ConfigFillIcon from '@/components/icons/ConfigFillIcon';
import ConfigIcon from '@/components/icons/ConfigIcon';
import EtiquetasFillIcon from '@/components/icons/EtiquetasFillIcon';
import EtiquetaIcon from '@/components/icons/EtiquetasIcon';
import EventFillIcon from '@/components/icons/EventFillIcon';
import EventIcon from '@/components/icons/EventIcon';
import HomeFillIcon from '@/components/icons/HomeFillIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import TemplateFillIcon from '@/components/icons/TemplateFillIcon';
import TemplateIcon from '@/components/icons/TemplateIcon';
import SidebarFiltroBase from '@/components/layout/SidebarFiltroBase';
import SidebarLink from '@/components/layout/SidebarLink';
import Image from 'next/image';
import ProfileFillIcon from '../icons/ModeloFillIcon';
import ProfileIcon from '../icons/ModeloIcon';
import PapeleraIcon from '../icons/PapeleraIcon';
import PapeleraFillIcon from '../icons/PapeleraFillIcon';
import SidebarLinkMensajes from '@/components/layout/SidebarLinkMensajes';
import MapIcon from '../icons/MapIcon';
import MapFillIcon from '../icons/MapFillIcon';

const Sidebar = () => {
  return (
    <div className='flex h-full w-48 flex-col border-r-[3px] border-black/20 bg-sidebar-background md:flex'>
      <Image
        src='/img/logo_manager.png'
        className='w-full select-none px-2 pb-4 pt-5'
        alt='Expo Manager'
        width={100}
        height={100}
      />
      <div className='flex-1'>
        <ul className='h-full'>
          <SidebarLink
            to='/'
            icon={<HomeIcon height={24} width={24} />}
            iconActive={<HomeFillIcon height={24} width={24} />}
          >
            Dashboard
          </SidebarLink>
          <SidebarLinkMensajes />
          <SidebarLink
            to={['/modelos', '/modelo']}
            icon={<ProfileIcon height={24} width={24} />}
            iconActive={<ProfileFillIcon height={24} width={24} />}
          >
            Base de Datos
          </SidebarLink>
          <SidebarLink
            to={['/etiquetas', '/asignacion']}
            icon={<EtiquetaIcon height={24} width={24} />}
            iconActive={<EtiquetasFillIcon height={24} width={24} />}
          >
            Etiquetas
          </SidebarLink>
          <SidebarLink
            to={'/eventos'}
            icon={<EventIcon height={24} width={24} />}
            iconActive={<EventFillIcon height={24} width={24} />}
          >
            Eventos
          </SidebarLink>
          <SidebarLink
            to='/plantilla'
            icon={<TemplateIcon height={24} width={24} />}
            iconActive={<TemplateFillIcon height={24} width={24} />}
          >
            Plantillas
          </SidebarLink>
          <SidebarLink
            to='/papelera'
            icon={<PapeleraIcon height={24} width={24} />}
            iconActive={<PapeleraFillIcon height={24} width={24} />}
          >
            Papelera
          </SidebarLink>
          <SidebarLink
            to='/mapa'
            icon={<MapIcon height={24} width={24} />}
            iconActive={<MapFillIcon height={24} width={24} />}
          >
            Mapa
          </SidebarLink>
        </ul>
      </div>
      <div className='justify-self-end'>
        <SidebarFiltroBase />
        <hr />
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
