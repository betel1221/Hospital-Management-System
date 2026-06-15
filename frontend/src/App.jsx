import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import AppointmentsQueue from './pages/AppointmentsQueue';
import PatientRecords from './pages/PatientRecords';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import ChatbotWidget from './components/ChatbotWidget';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const MainLayout = ({ children }) => (
  <div className="flex h-screen w-full overflow-hidden bg-[#f4f7fb] text-slate-800 font-sans">
    <Sidebar />
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      <Header />
      <div className="flex-1 overflow-y-auto relative">
        {children}
      </div>
    </main>
    <ChatbotWidget />
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><MainLayout><AppointmentsQueue /></MainLayout></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><MainLayout><PatientRecords /></MainLayout></ProtectedRoute>} />
          <Route path="/eprescribing" element={<ProtectedRoute><MainLayout><div className="p-8"><h2 className="text-2xl font-bold">E-Prescribing</h2></div></MainLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><MainLayout><div className="p-8"><h2 className="text-2xl font-bold">Settings</h2></div></MainLayout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
