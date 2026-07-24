import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isLoaded, isSignedIn } = useUser();

  // Wait for Clerk to finish loading before deciding — avoids a flash
  // redirect to "/" for users who are actually signed in.
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;