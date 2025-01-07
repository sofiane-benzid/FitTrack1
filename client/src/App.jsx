﻿import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { Login, Register, ProfileSetup, ProtectedRoute } from './components/auth';
import Dashboard from './pages/Dashboard';
import FitnessTrackerPage from './pages/FitnessTrackerPage';
import NutritionPage from './pages/NutritionPage';
import GamificationPage from './pages/GamificationPage';
import SocialPage from './pages/SocialPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route 
            path="/fitness" 
            element={
              <ProtectedRoute>
                <FitnessTrackerPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute>
                <NutritionPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/social" 
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/gamification" 
            element={
              <ProtectedRoute>
                <GamificationPage />
              </ProtectedRoute>
            } 
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;