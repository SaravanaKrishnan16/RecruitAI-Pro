import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ user, signOut }) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className={`w-10 h-10 bg-gradient-to-br from-naukri-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 ${isHovered ? 'rotate-12 scale-110' : ''}`}>
                <span className="text-white font-bold text-lg">🎯</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-naukri-blue to-purple-600 bg-clip-text text-transparent">
                RecruitAI Pro
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isActive('/') 
                    ? 'text-white bg-gradient-to-r from-naukri-blue to-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:text-naukri-blue hover:bg-blue-50'
                }`}
              >
                🏠 Dashboard
              </Link>
              <Link
                to="/upload"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isActive('/upload') 
                    ? 'text-white bg-gradient-to-r from-naukri-blue to-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:text-naukri-blue hover:bg-blue-50'
                }`}
              >
                📄 Upload Resume
              </Link>
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isActive('/jobs') 
                    ? 'text-white bg-gradient-to-r from-naukri-blue to-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:text-naukri-blue hover:bg-blue-50'
                }`}
              >
                💼 Jobs
              </Link>
              <Link
                to="/interviews"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isActive('/interviews') 
                    ? 'text-white bg-gradient-to-r from-naukri-blue to-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:text-naukri-blue hover:bg-blue-50'
                }`}
              >
                🎯 Interviews
              </Link>
              <Link
                to="/analytics"
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                  isActive('/analytics') 
                    ? 'text-white bg-gradient-to-r from-naukri-blue to-blue-600 shadow-lg' 
                    : 'text-gray-600 hover:text-naukri-blue hover:bg-blue-50'
                }`}
              >
                📊 Analytics
              </Link>

            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-3 bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 px-4 py-2 rounded-xl border border-green-200 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-naukri-blue to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs text-gray-500 font-medium">Welcome back</div>
                  <div className="text-sm font-semibold text-gray-800 truncate max-w-32">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-3 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className="p-2">
                  <button
                    onClick={signOut}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <span>🚪</span>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;