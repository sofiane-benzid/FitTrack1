import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Login, ProfileSetup, ProtectedRoute, Register } from './components/auth';
import { AuthProvider } from './context/AuthProvider';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Dashboard from './pages/Dashboard';
import FitnessTrackerPage from './pages/FitnessTrackerPage';
import GamificationPage from './pages/GamificationPage';
import NutritionPage from './pages/NutritionPage';
import SocialPage from './pages/SocialPage';
import ProfilePage from './pages/ProfilePage';

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

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <ProfilePage />
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