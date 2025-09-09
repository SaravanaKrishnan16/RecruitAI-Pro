import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock user database (in real app, this would be backend)
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignUp = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check if user already exists
    if (users.find(user => user.email === formData.email)) {
      setError('User already exists with this email');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    onLogin(newUser);
  };

  const handleSignIn = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    // Find user with exact credentials
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (!user) {
      setError('Invalid email or password');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(user));
    onLogin(user);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (isSignUp) {
        handleSignUp();
      } else {
        handleSignIn();
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 particles relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute bottom-32 left-40 w-5 h-5 bg-green-400/30 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400/30 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-naukri-blue to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-4 float hover-lift">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H11V21H5V3H13V9H21ZM14 10V12H16V10H14ZM14 13V15H16V13H14ZM14 16V18H16V16H14ZM17 10V12H19V10H17ZM17 13V15H19V13H17ZM17 16V18H19V16H17ZM20.5 18.5L19 20L20.5 21.5L22 20L20.5 18.5Z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">RecruitAI Pro</h1>
          <p className="text-gray-600 text-lg">Powered by <span className="font-semibold text-orange-600">Amazon Q CLI</span> & <span className="font-semibold text-blue-600">MCP</span></p>
        </div>

        {/* Auth Form */}
        <div className="card morphing-border hover-glow pulse-glow relative overflow-hidden">
          {/* Form Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 opacity-50 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 text-lg">
                {isSignUp ? 'Join thousands preparing for interviews' : 'Sign in to continue your journey'}
              </p>
            </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 slide-in-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="scale-in">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field hover-lift"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="scale-in stagger-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field hover-lift"
                placeholder="Enter your email"
              />
            </div>

            <div className="scale-in stagger-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field hover-lift"
                placeholder="Enter your password"
              />
            </div>

            {isSignUp && (
              <div className="scale-in stagger-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field hover-lift"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full ripple magnetic hover-glow pulse-glow relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-3"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="font-bold text-lg">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </span>
                )}
              </div>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-lg">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                }}
                className="ml-2 text-naukri-blue font-bold hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover-glow"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
          </div>


        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 fade-in">
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
            <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Voice Collection</p>
            <p className="text-xs text-orange-500 font-semibold">Amazon Q</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
            <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Auto Scoring</p>
            <p className="text-xs text-blue-500 font-semibold">MCP Powered</p>
          </div>
          <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl hover-lift">
            <div className="w-8 h-8 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zM4 9a1 1 0 000 2v5a1 1 0 001 1h10a1 1 0 001-1v-5a1 1 0 000-2H4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">Live Jobs API</p>
            <p className="text-xs text-purple-500 font-semibold">External APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;