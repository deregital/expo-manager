import ModalPassword from '@/components/configuracion/ModalPassword';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface DownloadDBProps {}

const DownloadDB = ({}: DownloadDBProps) => {
  const exportProfiles = trpc.csv.downloadProfiles.useMutation();
  const exportAllTables = trpc.csv.downloadAllTables.useMutation();

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
    try {
      toast.loading('Descargando CSV de participantes...');
      const response = await fetch('/api/configuration/profiles', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error('Error al descargar el CSV');
      }

      const blobWop = await response.blob();
      const urlWop = URL.createObjectURL(blobWop);

      const a = document.createElement('a');
      a.href = urlWop;
      a.download = 'PerfilModelos.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(urlWop); // Libera memoria
    } catch (error) {
      console.error('Error al descargar CSV:', error);
      toast.error('Error al descargar CSV');
    }
  };

  const handleDownloadZIP = async (password: string) => {
    const today = new Date();
    try {
      toast.loading('Descargando ZIP...');
      const zipData = await exportAllTables
        .mutateAsync(
          { password },
          {
            onError: (error) => {
              if (error.data?.code === 'CONFLICT') {
                toast.dismiss();
                toast.error('Contraseña incorrecta');
                setModalOpen(true);
                return;
              }
            },
          }
        )
        .catch((error) => {
          return;
        });

      if (!zipData) {
        return;
      }

      const uint8Array = new Uint8Array(zipData);

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
