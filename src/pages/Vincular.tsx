// src/pages/Vincular.tsx
import React from 'react';
import AdminWhatsapp from '../components/AdminWhatsapp'; // Importamos el componente

const Vincular = () => {
  return (
    <div className="w-full h-screen bg-gray-100">
      {/* Aquí podrías poner tu Navbar o Sidebar si tienes uno */}
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Configuración del Sistema</h1>
        
        {/* Aquí cargamos el componente del QR */}
        <AdminWhatsapp />
      </div>
    </div>
  );
};

export default Vincular;