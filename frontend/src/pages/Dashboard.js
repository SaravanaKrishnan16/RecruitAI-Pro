import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-naukri-blue to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Mock Interview Assistant</h1>
        <p className="text-blue-100 text-lg">
          Practice interviews, get AI feedback, and land your dream job
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/upload" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-naukri-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload Resume</h3>
              <p className="text-gray-600 text-sm">Start by uploading your resume</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Practice Interview</h3>
              <p className="text-gray-600 text-sm">Take AI-powered mock interviews</p>
            </div>
          </div>
        </div>

        <Link to="/jobs" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Find Jobs</h3>
              <p className="text-gray-600 text-sm">Get personalized job recommendations</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-naukri-blue">0</div>
          <div className="text-gray-600">Interviews Taken</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">-</div>
          <div className="text-gray-600">Average Score</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Job Applications</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">-</div>
          <div className="text-gray-600">ATS Score</div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <h3 className="font-medium">Upload Your Resume</h3>
              <p className="text-gray-600 text-sm">Upload your resume to get personalized interview questions and ATS analysis</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <h3 className="font-medium text-gray-500">Take Mock Interview</h3>
              <p className="text-gray-500 text-sm">Practice with AI-generated questions based on your profile</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <h3 className="font-medium text-gray-500">Get Feedback & Jobs</h3>
              <p className="text-gray-500 text-sm">Receive detailed feedback and personalized job recommendations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;