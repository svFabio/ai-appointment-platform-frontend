import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Calendario from './pages/Calendario';
import Home from './pages/Home'; // Importamos Home

function App() {
  return (
    <Routes>
       {/* El Layout siempre es Dashboard */}
       <Route path="/" element={<Dashboard />}>
          
          {/* Ruta Raíz (/) -> Muestra Home */}
          <Route index element={<Home />} />
          
          {/* Ruta /calendario -> Muestra Calendario */}
          <Route path="calendario" element={<Calendario />} />
          
          {/* Ruta /pagos -> Muestra Pagos */}
          <Route path="pagos" element={<Pagos />} />
          
       </Route>
    </Routes>
  );
}

export default App;