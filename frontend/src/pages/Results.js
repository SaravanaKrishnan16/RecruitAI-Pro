import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = () => {
    try {
      const storedResults = localStorage.getItem(`interview-${sessionId}`);
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naukri-blue"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Start New Interview
        </button>
      </div>
    );
  }

  const { overallResults, jobRecommendations, awsIntegrated } = results;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-naukri-blue to-purple-600 bg-clip-text text-transparent mb-4">
          Interview Results
        </h1>
        {awsIntegrated && (
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              Amazon Q Processed
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              MCP Scored
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Live Jobs Fetched
            </span>
          </div>
        )}
      </div>

      {/* Overall Score */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
        <div className="text-6xl font-bold text-naukri-blue mb-4">
          {overallResults?.overallScore || 0}%
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div>
            <div className="text-2xl font-bold text-blue-600">{overallResults?.technical || 0}</div>
            <div className="text-sm text-gray-600">Technical</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{overallResults?.communication || 0}</div>
            <div className="text-sm text-gray-600">Communication</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{overallResults?.completeness || 0}</div>
            <div className="text-sm text-gray-600">Completeness</div>
          </div>
        </div>
      </div>

      {/* Job Recommendations */}
      {jobRecommendations && jobRecommendations.jobs && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Live Job Recommendations</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              External APIs Powered
            </span>
          </div>
          
          <div className="grid gap-4">
            {jobRecommendations.jobs.slice(0, 3).map((job, index) => (
              <div key={job.jobId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{job.matchScore}% Match</div>
                    <div className="text-sm text-gray-500">{job.salary}</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{job.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.requirements.slice(0, 4).map((req, reqIndex) => (
                    <span key={reqIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {req}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Posted: {job.postedDate}</span>
                  <span>{job.applicants} applicants</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="btn-primary">
              View All {jobRecommendations.jobs.length} Recommendations
            </button>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      {overallResults && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold text-green-600 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {overallResults.strengths?.map((strength, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-bold text-orange-600 mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {overallResults.weaknesses?.map((weakness, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-orange-600 mr-2">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-x-4">
        <button onClick={() => navigate('/')} className="btn-secondary">
          Start New Interview
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          Download Report
        </button>
      </div>
    </div>
  );
};

export default Results;