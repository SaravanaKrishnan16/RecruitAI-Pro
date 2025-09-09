import React, { useState, useEffect } from 'react';

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState({
    totalInterviews: 0,
    averageScore: 0,
    improvementTrend: 0,
    strongestSkill: 'Communication',
    weakestSkill: 'Technical',
    recentPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateAnalytics();
  }, []);

  const calculateAnalytics = () => {
    const interviews = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('interview-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data.overallResults) {
            interviews.push(data.overallResults);
          }
        } catch (e) {
          console.error('Error parsing interview data:', e);
        }
      }
    }

    if (interviews.length > 0) {
      const avgScore = Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length);
      const avgTechnical = Math.round(interviews.reduce((sum, i) => sum + i.technical, 0) / interviews.length);
      const avgCommunication = Math.round(interviews.reduce((sum, i) => sum + i.communication, 0) / interviews.length);
      const avgCompleteness = Math.round(interviews.reduce((sum, i) => sum + i.completeness, 0) / interviews.length);

      const skillScores = {
        'Technical': avgTechnical,
        'Communication': avgCommunication,
        'Completeness': avgCompleteness
      };

      const strongest = Object.keys(skillScores).reduce((a, b) => skillScores[a] > skillScores[b] ? a : b);
      const weakest = Object.keys(skillScores).reduce((a, b) => skillScores[a] < skillScores[b] ? a : b);

      setAnalytics({
        totalInterviews: interviews.length,
        averageScore: avgScore,
        improvementTrend: interviews.length > 1 ? 
          interviews[interviews.length - 1].overallScore - interviews[0].overallScore : 0,
        strongestSkill: strongest,
        weakestSkill: weakest,
        recentPerformance: interviews.slice(-5).map((interview, index) => ({
          session: index + 1,
          score: interview.overallScore,
          technical: interview.technical,
          communication: interview.communication,
          completeness: interview.completeness
        }))
      });
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">📊</span>
            <h1 className="text-3xl font-bold">Performance Analytics</h1>
          </div>
          <p className="text-emerald-100 text-lg">
            Track your interview progress and identify areas for improvement
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-naukri-blue mb-2">{analytics.totalInterviews}</div>
          <div className="text-gray-600">Total Interviews</div>
          <div className="text-xs text-gray-500 mt-1">Practice sessions completed</div>
        </div>
        
        <div className="card text-center">
          <div className={`text-3xl font-bold mb-2 ${getScoreColor(analytics.averageScore)}`}>
            {analytics.averageScore}%
          </div>
          <div className="text-gray-600">Average Score</div>
          <div className="text-xs text-gray-500 mt-1">Overall performance</div>
        </div>
        
        <div className="card text-center">
          <div className={`text-3xl font-bold mb-2 ${getProgressColor(analytics.improvementTrend)}`}>
            {analytics.improvementTrend > 0 ? '+' : ''}{analytics.improvementTrend}%
          </div>
          <div className="text-gray-600">Improvement</div>
          <div className="text-xs text-gray-500 mt-1">Since first interview</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {analytics.totalInterviews > 0 ? Math.round((analytics.totalInterviews / 10) * 100) : 0}%
          </div>
          <div className="text-gray-600">Progress</div>
          <div className="text-xs text-gray-500 mt-1">Towards mastery</div>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">💪</span>
            Skill Strengths
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="font-medium text-green-800">Strongest Skill</div>
                <div className="text-sm text-green-600">{analytics.strongestSkill}</div>
              </div>
              <div className="text-2xl">🏆</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div>
                <div className="font-medium text-orange-800">Focus Area</div>
                <div className="text-sm text-orange-600">{analytics.weakestSkill}</div>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">📈</span>
            Recent Performance
          </h3>
          {analytics.recentPerformance.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentPerformance.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-naukri-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {session.session}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Session {session.session}</div>
                      <div className="text-gray-600">Recent interview</div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getScoreColor(session.score)}`}>
                    {session.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No performance data yet</p>
              <p className="text-sm">Complete interviews to see analytics</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <span className="text-2xl mr-2">💡</span>
          Personalized Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">🎯</span>
              <h4 className="font-medium text-blue-800">Practice Focus</h4>
            </div>
            <p className="text-sm text-blue-700">
              {analytics.averageScore < 60 
                ? "Focus on fundamental concepts and practice basic questions"
                : analytics.averageScore < 80
                ? "Work on advanced topics and improve answer structure"
                : "Maintain excellence and explore leadership scenarios"
              }
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">📚</span>
              <h4 className="font-medium text-green-800">Study Areas</h4>
            </div>
            <p className="text-sm text-green-700">
              {analytics.weakestSkill === 'Technical' 
                ? "Review technical concepts and practice coding problems"
                : analytics.weakestSkill === 'Communication'
                ? "Practice explaining concepts clearly and concisely"
                : "Work on providing complete, structured answers"
              }
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">⏰</span>
              <h4 className="font-medium text-purple-800">Next Steps</h4>
            </div>
            <p className="text-sm text-purple-700">
              {analytics.totalInterviews < 3
                ? "Take more practice interviews to build confidence"
                : analytics.improvementTrend <= 0
                ? "Focus on consistent improvement in weak areas"
                : "Continue practicing to maintain upward trend"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;