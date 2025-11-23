import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import JobDetails from '@/pages/JobDetails';
import AuthCallback from '@/pages/AuthCallback';

const ProtectedLayout = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
