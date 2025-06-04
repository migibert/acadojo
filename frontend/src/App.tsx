import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import HomePage from './pages/HomePage'; // This could be a public landing page
import MyAcademiesPage from './pages/MyAcademiesPage';
import AcademyDashboardPage from './pages/AcademyDashboardPage';
import CyclesPage from './pages/CyclesPage';
import StudentsPage from './pages/StudentsPage';
import ProfilePage from './pages/ProfilePage';
import CallbackPage from './pages/CallbackPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> {/* Layout is the main shell */}
          <Route index element={<HomePage />} /> {/* Public landing page */}

          {/* Protected Routes: each page component is wrapped */}
          <Route path="academies" element={<ProtectedRoute><MyAcademiesPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/dashboard" element={<ProtectedRoute><AcademyDashboardPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/cycles" element={<ProtectedRoute><CyclesPage /></ProtectedRoute>} />
          <Route path="academies/:academyId/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Example: redirect /app to /academies if /app itself has no index and is protected */}
          {/* The ProtectedRoute here ensures that if a user lands on /app, they are authenticated before redirecting */}
          <Route path="app" element={<ProtectedRoute><Navigate to="/academies" replace /></ProtectedRoute>} />

        </Route>

        <Route path="/callback" element={<CallbackPage />} /> {/* Auth0 Callback route, typically without Layout */}
        <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
