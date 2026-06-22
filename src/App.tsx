import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/customer/Home';
import Login from './pages/auth/Login';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        {/* Ruta de Admin (Temporalmente desprotegida para probar) */}
        <Route path="/admin" element={<Dashboard />} />

        {/* Redirección por si meten cualquier otra URL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;