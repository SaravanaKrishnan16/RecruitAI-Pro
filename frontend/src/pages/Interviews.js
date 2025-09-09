import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Interviews = ({ user }) => {
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    loadInterviewHistory();
  }, []);

  const loadInterviewHistory = () => {
    // Load from localStorage
    const history = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('interview-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          history.push({
            sessionId: key.replace('interview-', ''),
            ...data,
            date: new Date().toISOString().split('T')[0]
          });
        } catch (e) {
          console.error('Error parsing interview data:', e);
        }
      }
    }
    setInterviewHistory(history.reverse());
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naukri-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">🎯</span>
            <h1 className="text-3xl font-bold">Interview Practice</h1>
          </div>
          <p className="text-purple-100 text-lg mb-4">
            Master your interview skills with AI-powered practice sessions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{interviewHistory.length}</div>
              <div className="text-purple-200 text-sm">Interviews Taken</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">
                {interviewHistory.length > 0 
                  ? Math.round(interviewHistory.reduce((sum, i) => sum + (i.overallResults?.overallScore || 0), 0) / interviewHistory.length)
                  : 0}
              </div>
              <div className="text-purple-200 text-sm">Average Score</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">
                {interviewHistory.filter(i => (i.overallResults?.overallScore || 0) >= 70).length}
              </div>
              <div className="text-purple-200 text-sm">Strong Performances</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/upload" className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start New Interview</h3>
            <p className="text-gray-600">Begin a fresh interview session with AI-generated questions</p>
          </div>
        </Link>
        
        <div 
          className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          onClick={() => setShowTips(true)}
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Practice Tips</h3>
            <p className="text-gray-600">Learn interview strategies and best practices</p>
          </div>
        </div>
      </div>

      {/* Interview History */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Interview History
          </h2>
          {interviewHistory.length > 0 && (
            <button 
              onClick={loadInterviewHistory}
              className="btn-secondary text-sm"
            >
              Refresh
            </button>
          )}
        </div>

        {interviewHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No interviews yet</h3>
            <p className="text-gray-600 mb-6">Start your first interview to see your progress here</p>
            <Link to="/upload" className="btn-primary">
              Take Your First Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {interviewHistory.map((interview, index) => (
              <div key={interview.sessionId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {interview.selectedRole?.title || 'General Interview'}
                      </h3>
                      <p className="text-sm text-gray-600">Session ID: {interview.sessionId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(interview.overallResults?.overallScore || 0)}`}>
                      {interview.overallResults?.overallScore || 0}% Overall
                    </span>
                    <Link 
                      to={`/results/${interview.sessionId}`}
                      className="btn-secondary text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Technical:</span>
                    <span className="ml-2 font-medium">{interview.overallResults?.technical || 0}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Communication:</span>
                    <span className="ml-2 font-medium">{interview.overallResults?.communication || 0}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Completeness:</span>
                    <span className="ml-2 font-medium">{interview.overallResults?.completeness || 0}%</span>
                  </div>
                </div>

                {interview.overallResults?.strengths && interview.overallResults.strengths.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm">
                      <span className="text-gray-600">Strengths:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {interview.overallResults.strengths.slice(0, 3).map((strength, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="text-3xl mr-3">🎯</span>
                  Interview Success Guide
                </h2>
                <button 
                  onClick={() => setShowTips(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                      <span className="mr-2">💡</span> Before the Interview
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Research the company and role thoroughly</li>
                      <li>• Practice common questions out loud</li>
                      <li>• Prepare specific examples using STAR method</li>
                      <li>• Test your technology and internet connection</li>
                      <li>• Prepare thoughtful questions to ask</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                      <span className="mr-2">🗣️</span> During the Interview
                    </h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Speak clearly and at a moderate pace</li>
                      <li>• Use specific examples and quantify results</li>
                      <li>• Ask clarifying questions when needed</li>
                      <li>• Show enthusiasm and genuine interest</li>
                      <li>• Maintain good eye contact and posture</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <span className="mr-2">⭐</span> STAR Method
                    </h3>
                    <div className="text-sm text-purple-700 space-y-2">
                      <div><strong>Situation:</strong> Set the context</div>
                      <div><strong>Task:</strong> Describe your responsibility</div>
                      <div><strong>Action:</strong> Explain what you did</div>
                      <div><strong>Result:</strong> Share the outcome</div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                      <span className="mr-2">🚀</span> Technical Questions
                    </h3>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Think out loud while solving problems</li>
                      <li>• Break down complex problems into steps</li>
                      <li>• Discuss trade-offs and alternatives</li>
                      <li>• Ask about requirements and constraints</li>
                      <li>• Test your solution with examples</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">💪</span> Common Question Types
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Behavioral:</div>
                    <div className="text-gray-600">"Tell me about a time when..."</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Technical:</div>
                    <div className="text-gray-600">"How would you implement..."</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Situational:</div>
                    <div className="text-gray-600">"What would you do if..."</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setShowTips(false)}
                  className="btn-primary"
                >
                  Got it! Let's Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;