import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import Auth from './pages/Auth';
import RoleSelection from './pages/RoleSelection';
import ResumeUpload from './pages/ResumeUpload';
import Interview from './pages/Interview';
import Results from './pages/Results';
import Jobs from './pages/Jobs';
import Interviews from './pages/Interviews';
import Analytics from './pages/Analytics';
import FeatureTest from './components/FeatureTest';

function App() {
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create demo user if not exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (!users.find(u => u.email === 'demo@example.com')) {
      const demoUser = {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'demo123'
      };
      users.push(demoUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setSelectedRole(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} signOut={handleSignOut} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<RoleSelection onRoleSelect={setSelectedRole} />} />
            <Route path="/upload" element={<ResumeUpload user={user} selectedRole={selectedRole} />} />
            <Route path="/interview/:sessionId" element={<Interview user={user} selectedRole={selectedRole} />} />
            <Route path="/results/:sessionId" element={<Results user={user} />} />
            <Route path="/jobs" element={<Jobs user={user} />} />
            <Route path="/interviews" element={<Interviews user={user} />} />
            <Route path="/analytics" element={<Analytics user={user} />} />
            <Route path="/test-features" element={<FeatureTest />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;