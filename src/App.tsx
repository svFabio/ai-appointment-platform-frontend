import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Pagos from './pages/Pagos';
import Calendario from './pages/Calendario';
import Home from './pages/Home'; // Importamos Home
import Vincular from './pages/Vincular';

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

          {/* Ruta /vincular -> Muestra lo del WA goood*/}
          <Route path="/vincular" element={<Vincular />} />
          
       </Route>
    </Routes>
  );
}

export default App;