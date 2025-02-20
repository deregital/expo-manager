import ModalPassword from '@/components/configuracion/ModalPassword';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface DownloadDBProps {}

const DownloadDB = ({}: DownloadDBProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState('');

  const handleOpenModal = (type: string) => {
    setDownloadType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDownloadType('');
  };

  const handlePasswordSubmit = async (password: string) => {
    handleCloseModal();

    if (downloadType === 'csv') {
      handleDownloadCSV(password);
    } else if (downloadType === 'zip') {
      handleDownloadZIP(password);
    }
  };

  const handleDownloadCSV = async (password: string) => {
    const today = new Date();
    try {
      toast.loading('Descargando CSV de participantes...', {
        id: 'downloading-csv',
      });
      const response = await fetch('/api/configuration/profiles', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();

        toast.dismiss();
        toast.error(`Error al descargar CSV: ${error}`);
        return;
        // throw new Error('Error al descargar el CSV');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `PerfilModelos_${today.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url); // Libera memoria
      toast.dismiss('downloading-csv');
      toast.success('CSV descargado correctamente');
    } catch (error) {
      toast.dismiss('downloading-csv');
      console.error('Error al descargar CSV:', error);
      toast.error('Error al descargar CSV');
    }
  };

  const handleDownloadZIP = async (password: string) => {
    const today = new Date();
    try {
      toast.loading('Descargando ZIP...');
      const response = await fetch('/api/configuration/all-tables', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();

        toast.dismiss();
        toast.error(`Error al descargar las tablas: ${error}`);
        return;
        // throw new Error('Error al descargar el CSV');
      }

      const uint8Array = new Uint8Array(await response.arrayBuffer());

      const blob = new Blob([uint8Array], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${today.toISOString()}-todas_las_tablas.zip`
      );
      document.body.appendChild(link);

      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('ZIP descargado correctamente');
      toast.dismiss();
    } catch (error) {
      console.error('Error al descargar ZIP:', error);
      toast.error('Error al descargar ZIP');
    }
  };
  return (
    <div className='flex gap-x-5'>
      <ModalPassword
        onSubmit={handlePasswordSubmit}
        handleCloseModal={handleCloseModal}
        handleOpenModal={() => handleOpenModal('csv')}
        isModalOpen={isModalOpen}
      >
        Descargar Participantes
      </ModalPassword>
      <ModalPassword
        onSubmit={handlePasswordSubmit}
        handleCloseModal={handleCloseModal}
        handleOpenModal={() => handleOpenModal('zip')}
        isModalOpen={isModalOpen}
      >
        Descargar Tablas
      </ModalPassword>
    </div>
  );
};

export default DownloadDB;
