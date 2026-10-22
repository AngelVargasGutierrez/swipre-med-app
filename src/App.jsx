import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicamentos from './pages/Medicamentos';
import NuevoMedicamento from './pages/NuevoMedicamento';
import ControlInventario from './pages/ControlInventario';
import SemaforoDetalle from './pages/SemaforoDetalle';

import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Login />;

  // Proteger rutas basado en el rol
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  const isSemaforo = location.pathname.startsWith('/semaforo');
  const isNuevoMed = location.pathname === '/medicamentos/nuevo';
  
  const basePage = isNuevoMed ? 'medicamentos' : (isSemaforo ? 'dashboard' : currentPath);
  
  if (basePage !== '' && !user.menu.includes(basePage)) {
    return <Navigate to={`/${user.menu[0]}`} replace />;
  }

  const navPage = isNuevoMed ? 'medicamentos' : (isSemaforo ? 'dashboard' : currentPath);

  return (
    <div className="app-layout">
      <Sidebar currentPage={navPage || 'dashboard'} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to={`/${user.menu[0]}`} replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/semaforo/stock" element={<SemaforoDetalle tipo="stock" />} />
          <Route path="/semaforo/vencimiento" element={<SemaforoDetalle tipo="vencimiento" />} />
          <Route path="/medicamentos" element={<Medicamentos />} />
          <Route path="/medicamentos/nuevo" element={<NuevoMedicamento />} />
          <Route path="/inventario" element={<ControlInventario />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="*" element={<Navigate to={`/${user.menu[0]}`} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
