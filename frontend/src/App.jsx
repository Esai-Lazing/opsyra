import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ModernLayout from './layouts/ModernLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Engins from './pages/Engins';
import Camions from './pages/Camions';
import Users from './pages/Users';
import Assignments from './pages/Assignments';
import Welcome from './pages/Welcome';
import About from './pages/About';
import Contact from './pages/Contact';
import MonCamion from './pages/MonCamion';
import RapportFuel from './pages/RapportFuel';
import Fuel from './pages/Fuel';
import Incidents from './pages/Incidents';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ModernLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="engins" element={<Engins />} />
          <Route path="camions" element={<Camions />} />
          <Route path="personnel" element={<Users />} />
          <Route path="assignments" element={<Assignments />} />

          {/* Chauffeur specific */}
          <Route path="mon-camion" element={<MonCamion />} />
          <Route path="rapport-fuel" element={<RapportFuel />} />

          {/* Logistics & Management */}
          <Route path="fuel" element={<Fuel />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="notifications" element={<Notifications />} />

          {/* User Management */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
