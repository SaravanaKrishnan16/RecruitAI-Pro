import React, { useState, useEffect } from 'react';

const Interviews = ({ user }) => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    // Load interview history from localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('interview-'));
    const interviewData = keys.map(key => ({
      sessionId: key.replace('interview-', ''),
      ...JSON.parse(localStorage.getItem(key))
    }));
    setInterviews(interviewData);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Interview History</h1>
      
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No interviews completed yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.sessionId} className="card">
              <h3 className="font-semibold">{interview.selectedRole?.title || 'Interview'}</h3>
              <p className="text-gray-600">Session: {interview.sessionId}</p>
              <p className="text-gray-600">Questions: {interview.answers?.length || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;