import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseResume } from '../utils/resumeParser';

const findMissingSkills = (candidateSkills, requiredSkills) => {
  const allCandidateSkills = Object.values(candidateSkills).flat().map(skill => skill.toLowerCase());
  return requiredSkills.filter(skill => 
    !allCandidateSkills.some(candidateSkill => 
      candidateSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(candidateSkill)
    )
  );
};

const ResumeUpload = ({ user, selectedRole }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type.includes('document'))) {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF or Word document');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      console.log('Starting to parse file:', file.name, file.type);
      
      // Parse the actual resume file
      const response = await parseResume(file);
      console.log('Parse result:', response);
      
      response.candidateId = user.id || user.sub;
      
      // Analyze missing skills for selected role
      if (selectedRole) {
        response.missingSkills = findMissingSkills(response.skills, selectedRole.requiredSkills);
        response.selectedRole = selectedRole;
      }
      setAnalysis(response);
    } catch (error) {
      console.error('Detailed error:', error);
      alert(`Failed to parse resume: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const startInterview = async () => {
    try {
      // Store candidate data for Amazon Q
      localStorage.setItem('candidateProfile', JSON.stringify({
        experience: analysis.experience,
        domain: analysis.domain,
        atsScore: analysis.atsScore
      }));
      
      localStorage.setItem('resumeData', JSON.stringify({
        skills: Object.values(analysis.skills).flat(),
        education: analysis.education,
        contact: analysis.contact
      }));
      
      // Store selected role for interview
      localStorage.setItem('selectedRole', JSON.stringify(selectedRole));
      
      const response = {
        sessionId: `session-${Date.now()}`
      };

      navigate(`/interview/${response.sessionId}`);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Resume</h1>
        <p className="text-gray-600">
          Upload your resume to get personalized interview questions and ATS analysis
        </p>
      </div>

      {!analysis ? (
        <div className="card max-w-2xl mx-auto">
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PDF or Word documents up to 10MB
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>

            {file && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing Resume...</span>
                    </div>
                  ) : (
                    'Upload & Analyze Resume'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Analysis Results */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Resume Analysis Complete</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-naukri-blue">{analysis.atsScore}</div>
                <div className="text-gray-600">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analysis.experience}</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">{analysis.domain}</div>
                <div className="text-gray-600">Best Fit Domain</div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Extracted Skills</h3>
              <div className="space-y-3">
                {Object.entries(analysis.skills).map(([category, skills]) => (
                  skills.length > 0 && (
                    <div key={category}>
                      <div className="text-sm font-medium text-gray-700 mb-1">{category}</div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Additional Info */}
            {analysis.contact && Object.keys(analysis.contact).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                  {analysis.contact.email && <div className="text-sm">📧 {analysis.contact.email}</div>}
                  {analysis.contact.phone && <div className="text-sm">📞 {analysis.contact.phone}</div>}
                  {analysis.contact.linkedin && <div className="text-sm">💼 {analysis.contact.linkedin}</div>}
                  {analysis.contact.github && <div className="text-sm">🔗 {analysis.contact.github}</div>}
                </div>
              </div>
            )}

            {analysis.education && analysis.education.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Education</h3>
                <div className="space-y-1">
                  {analysis.education.map((edu, index) => (
                    <span key={index} className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md mr-2 mb-2">
                      {edu}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Role-specific Analysis */}
            {analysis.selectedRole && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Role Analysis: {analysis.selectedRole.title}</h3>
                
                {analysis.missingSkills && analysis.missingSkills.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      Consider learning these skills to improve your chances for this role.
                    </p>
                  </div>
                )}
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.selectedRole.requiredSkills.filter(skill => 
                      !analysis.missingSkills?.includes(skill)
                    ).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={startInterview}
                className="btn-primary text-lg px-8 py-3"
              >
                Start Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;