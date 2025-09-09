import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { allRoles } from '../data/roles';

const RoleSelection = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [hoveredRole, setHoveredRole] = useState(null);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    onRoleSelect(role);
    navigate('/upload');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in">
      <div className="text-center slide-in-left">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-naukri-blue to-purple-600 bg-clip-text text-transparent mb-4">
          AI-Powered Role Assessment
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          Select your target role for intelligent interview analysis powered by <span className="font-semibold text-orange-600">Amazon Q CLI</span> and <span className="font-semibold text-blue-600">MCP</span>.
        </p>
        <p className="text-sm text-gray-500">
          Advanced AI capabilities: Resume parsing with NLP, voice transcription, automated scoring algorithms, and real-time job matching to streamline your recruitment journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allRoles.map((role, index) => (
          <div
            key={role.id}
            onClick={() => handleRoleSelect(role)}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            className={`role-card group scale-in stagger-${(index % 6) + 1}`}
          >
            <div className="text-center">
              <div className={`role-icon transition-all duration-500 ${hoveredRole === role.id ? 'animate-bounce' : ''}`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-naukri-blue transition-colors duration-300">
                {role.title}
              </h3>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2 font-medium">Required Skills:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {role.requiredSkills.slice(0, 4).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className={`px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-xs rounded-full font-medium transform transition-all duration-300 hover:scale-110 ${hoveredRole === role.id ? 'animate-pulse' : ''}`}
                      style={{ animationDelay: `${skillIndex * 0.1}s` }}
                    >
                      {skill}
                    </span>
                  ))}
                  {role.requiredSkills.length > 4 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs rounded-full font-medium">
                      +{role.requiredSkills.length - 4} more
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 font-medium bg-gray-50 rounded-lg py-2 px-4">
                🎯 {role.questions.length} interview questions
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center slide-in-right">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 max-w-2xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Intelligent Recruitment Process</h3>
          <div className="text-sm text-gray-700 space-y-3">
            <div className="flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
              <span className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <p>AI analyzes your role selection</p>
            </div>
            <div className="flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
              <span className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <p>Resume parsing & ATS scoring with Amazon Q</p>
            </div>
            <div className="flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
              <span className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <p>Skill gap analysis & recommendations</p>
            </div>
            <div className="flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
              <span className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <p>Voice-based AI interview assessment</p>
            </div>
            <div className="flex items-center justify-start space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
              <span className="w-6 h-6 bg-naukri-blue text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <p>Live job matching & recruitment insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;