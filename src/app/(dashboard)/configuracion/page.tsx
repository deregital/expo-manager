"use client"
import { trpc } from '@/lib/trpc';
import React from 'react';
import { toast } from 'sonner';


const ConfiguracionPage = () => {
  const exportModelos = trpc.csv.downloadModelos.useMutation();

  const exportAllTables = trpc.csv.downloadAllTables.useMutation();

  const handleDownloadCSV = async () => {
    try {
      toast.loading('Descargando CSV de modelos...');
      const csvData = await exportModelos.mutateAsync(); 

      const blob = new Blob([csvData], { type: 'text/csv' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelos.csv');
      document.body.appendChild(link);

      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      toast.success('CSV descargado correctamente');
      toast.dismiss();
    } catch (error) {
      console.error('Error al descargar CSV:', error);
    }
  };

  const handleDownloadZIP = async () => {
    try {
      toast.loading('Descargando ZIP...');
      const zipData = await exportAllTables.mutateAsync();
      
      const uint8Array = new Uint8Array(zipData.data);

      const blob = new Blob([uint8Array], { type: 'application/zip' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'todas_las_tablas.zip');
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
      <p className='px-5'>ConfiguracionPage</p>
      {}
      <div className='mt-5 px-5'>
        {/* Botón para descargar el archivo CSV con estilos */}
        <button
          onClick={handleDownloadCSV}
          className='px-4 py-2 bg-blue-500 text-white rounded cursor-pointer text-lg font-bold shadow-md transition duration-300 hover:bg-blue-600'
        >
          Descargar Modelos
        </button>
        <button
          onClick={handleDownloadZIP}
          className='ml-3 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer text-lg font-bold shadow-md transition duration-300 hover:bg-blue-600'
        >
          Descargar tabla
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
