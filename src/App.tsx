import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Calendario from './pages/Calendario';
import Home from './pages/Home';
import Vincular from './pages/Vincular';

function App() {
  return (
    <div className="App">
      <Routes>
          {/* El Layout siempre es Dashboard */}
          <Route path="/" element={<Dashboard />}>
            
            {/* Ruta Raíz (/) -> Muestra Home */}
            <Route index element={<Home />} />
            
            {/* Ruta /calendario -> Muestra Calendario */}
            <Route path="calendario" element={<Calendario />} />
            
            {/* Ruta /pagos -> Muestra Pagos */}
            <Route path="pagos" element={<Pagos />} />

            {/* Ruta /vincular -> Muestra lo del WA */}
            <Route path="vincular" element={<Vincular />} />
            
         </Route>
         
         {/* Ruta para manejar 404 - redirige al home */}
         <Route path="*" element={<div className="flex items-center justify-center min-h-screen bg-gray-50">
           <div className="text-center">
             <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
             <p className="text-gray-600 mb-4">Página no encontrada</p>
             <a href="/" className="bg-kenyan-copper-600 text-white px-4 py-2 rounded-lg hover:bg-kenyan-copper-700 transition-colors">
               Volver al Inicio
             </a>
           </div>
         </div>} />
      </Routes>
    </div>
  );
}

export default App;