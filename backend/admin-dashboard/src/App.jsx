import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/Users';
import Dictionary from './pages/Dictionary';
import SettingsPage from './pages/Settings';
import History from './pages/History';
import SuggestionsPage from './pages/Suggestions';

const ProtectedLayout = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router basename="/admin">
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
