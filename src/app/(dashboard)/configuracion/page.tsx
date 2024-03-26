"use client"
import { trpc } from '@/lib/trpc';
import React from 'react';


const ConfiguracionPage = () => {
  const exportModelos = trpc.csv.downloadModelos.useMutation();

  const { data } = trpc.csv.downloadDatabase.useQuery();
  console.log(data);
  const handleDownloadCSV = async () => {
    try {
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
    } catch (error) {
      console.error('Error al descargar CSV:', error);
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
          // style={{
          //   padding: '10px 20px',
          //   backgroundColor: '#007bff',
          //   color: '#fff',
          //   border: 'none',
          //   borderRadius: '5px',
          //   cursor: 'pointer',
          //   fontSize: '16px',
          //   fontWeight: 'bold',
          //   boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          //   transition: 'background-color 0.3s',
          // }}
        >
          Descargar Modelos
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
