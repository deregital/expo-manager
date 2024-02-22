import Image from 'next/image';
import React from 'react';

const Sidebar = () => {
  return (
    <div className="flex w-60 flex-col bg-blue-500">
      <Image
        src="/img/logo.webp"
        className="w-full select-none px-2 pb-10 pt-5"
        alt="Expo Manager"
        width={100}
        height={100}
      />
      <div className="flex-1">
        <ul>
          <li>Dashboard</li>
          <li>Gestión de modelos</li>
          <li>Envío de mensajes</li>
          <li>Gestor de etiquetas</li>
        </ul>
      </div>
      <div className="justify-self-end">
        <p>Configuración</p>
      </div>
    </div>
  );
};

export default Sidebar;
