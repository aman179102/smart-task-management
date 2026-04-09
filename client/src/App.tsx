import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';

// Root redirect component that checks auth state
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [forceRedirect, setForceRedirect] = useState(false);

  useEffect(() => {
    // Force redirect after 3 seconds if still loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Auth loading timeout, forcing redirect');
        setForceRedirect(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading && !forceRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <Tasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />

          {/* Root route with auth-aware redirect */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
