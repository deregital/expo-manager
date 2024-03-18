"use client"
import React from 'react';


const ConfiguracionPage = () => {
  // Función para manejar la descarga del archivo CSV
  const handleDownloadCSV = async () => {
    try {
     
      const response = await fetch('/api/exportModelos'); 
      const csvData = await response.text();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

     
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'modelos.csv');
      document.body.appendChild(link);
      link.click();

      // Limpiar después de la descarga
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar CSV:', error);
    }
  };

  return (
    <div>
      <p>ConfiguracionPage</p>
      {}
      <div style={{ marginTop: '20px' }}>
        {/* Botón para descargar el archivo CSV con estilos */}
        <button
          onClick={handleDownloadCSV} 
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s',
          }}
        >
          Descargar Modelos
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;
