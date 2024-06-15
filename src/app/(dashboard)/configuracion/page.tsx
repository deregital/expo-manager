'use client';
import { trpc } from '@/lib/trpc';
import React, { useState } from 'react';
import { toast } from 'sonner';
import ModalPassword from '@/components/config/ModalPassword';

const ConfiguracionPage = () => {
  const exportModelos = trpc.csv.downloadModelos.useMutation();
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
      toast.loading('Descargando CSV de modelos...');
      const csvData = await exportModelos
        .mutateAsync(
          { password },
          {
            onError: (error) => {
              if (error.data?.code === 'UNAUTHORIZED') {
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

      if (!csvData) {
        return;
      }

      const now = new Date();
      const filename = `PerfilModelos_${now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')}.csv`;

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);

      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('CSV descargado correctamente');
      toast.dismiss();
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
              if (error.data?.code === 'UNAUTHORIZED') {
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

      const uint8Array = new Uint8Array(zipData.data);

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
    <div>
      <p className='p-3 text-xl font-bold md:p-5 md:text-3xl'>Configuración</p>
      <div className='mt-5 flex gap-x-5 px-5'>
        <ModalPassword
          onSubmit={handlePasswordSubmit}
          handleCloseModal={handleCloseModal}
          handleOpenModal={() => handleOpenModal('csv')}
          isModalOpen={isModalOpen}
        >
          Descargar Modelos
        </ModalPassword>
        <ModalPassword
          onSubmit={handlePasswordSubmit}
          handleCloseModal={handleCloseModal}
          handleOpenModal={() => handleOpenModal('zip')}
          isModalOpen={isModalOpen}
        >
          Descargar Modelos
        </ModalPassword>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
