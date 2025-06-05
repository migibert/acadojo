import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { setupAuthInterceptor } from './services/apiService';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import MyAcademiesPage from './pages/MyAcademiesPage';
import AcademyDashboardPage from './pages/AcademyDashboardPage';
import CyclesPage from './pages/CyclesPage';
import StudentsPage from './pages/StudentsPage';
import ProfilePage from './pages/ProfilePage';
import CallbackPage from './pages/CallbackPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0(); // Added isLoading

  useEffect(() => {
    if (isAuthenticated && !isLoading) { // Check !isLoading
      setupAuthInterceptor(getAccessTokenSilently);
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]); // Added isLoading to dependencies

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="academies" element={<ProtectedRoute><MyAcademiesPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/dashboard" element={<ProtectedRoute><AcademyDashboardPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/cycles" element={<ProtectedRoute><CyclesPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="app" element={<ProtectedRoute><Navigate to="/academies" replace /></ProtectedRoute>} />
        </Route>
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
