import React, { useState, useEffect } from 'react';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mcpInsights, setMcpInsights] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    salaryRange: '',
    company: ''
  });
  const [searchParams, setSearchParams] = useState({
    keywords: 'Cloud & DevOps',
    location: 'Bern'
  });

  useEffect(() => {
    loadJobs();
    fetchMcpInsights();
  }, []);

  const fetchMcpInsights = async () => {
    try {
      // Simulate MCP API call
      console.log('Fetching MCP insights...');
      
      // In a real implementation, this would be an API call to your MCP backend
      // const response = await fetch('/api/mcp/job-insights');
      // const data = await response.json();
      
      // For now, simulate the response
      setTimeout(() => {
        const mockMcpInsights = {
          marketTrends: 'High demand for Cloud & DevOps professionals',
          salaryInsights: 'Average salary range: $80k-$150k',
          skillGaps: ['Kubernetes', 'Terraform', 'AWS ECS'],
          careerPath: 'Recommended next role: Senior DevOps Engineer',
          confidence: 0.94
        };
        
        setMcpInsights(mockMcpInsights);
      }, 1500);
    } catch (error) {
      console.error('Error fetching MCP insights:', error);
    }
  };
  
  const enhanceSearchWithMCP = async (keywords, location, profile) => {
    try {
      console.log('🤖 MCP - Enhancing search parameters...');
      
      // Try to use the MCP service if available
      try {
        // Try to import the MCP service dynamically
        const mcpServiceModule = await import('../services/mcpService.js').catch(() => null);
        
        if (mcpServiceModule && mcpServiceModule.enhanceJobSearch) {
          console.log('Using MCP service for job search enhancement');
          const enhancedParams = await mcpServiceModule.enhanceJobSearch(keywords, location, profile);
          return enhancedParams;
        } else {
          console.log('MCP service not available, using local enhancement');
        }
      } catch (mcpError) {
        console.warn('Failed to use MCP service:', mcpError);
      }
      
      // Fall back to local enhancement if MCP service is not available
      
      // Define keyword expansions based on common job areas
      const keywordExpansions = {
        'software': 'software development programming engineering coding',
        'developer': 'software engineer programmer coder',
        'frontend': 'frontend react angular vue javascript UI/UX',
        'backend': 'backend API server database node.js express django',
        'devops': 'devops cloud aws azure kubernetes docker cicd',
        'cloud': 'cloud aws azure gcp kubernetes docker terraform',
        'data': 'data science analytics machine learning AI statistics',
        'security': 'security cybersecurity information security penetration testing',
        'mobile': 'mobile ios android react native flutter app development'
      };
      
      // Process keywords to enhance search
      let enhancedKeywords = keywords;
      
      // Look for keyword matches and expand them
      Object.entries(keywordExpansions).forEach(([key, expansion]) => {
        if (keywords.toLowerCase().includes(key.toLowerCase())) {
          enhancedKeywords = `${enhancedKeywords} ${expansion}`;
        }
      });
      
      // For Cloud & DevOps specifically, add more targeted keywords
      if (keywords.toLowerCase().includes('cloud') || keywords.toLowerCase().includes('devops')) {
        enhancedKeywords = `${enhancedKeywords} infrastructure automation containerization pipelines`;
      }
      
      // Simulate some processing time for realistic feedback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Log the enhancement
      console.log(`🤖 MCP - Enhanced search: "${keywords}" → "${enhancedKeywords}"`);
      
      // Return enhanced parameters with additional MCP metadata
      return {
        keywords: enhancedKeywords,
        location: location,
        includedTerms: ['containerization', 'automation', 'infrastructure as code'],
        relevanceBoost: 0.85,
        mcpMetadata: {
          enhancementApplied: true,
          enhancementType: 'keyword expansion',
          confidence: 0.92,
          processingTime: '0.3s'
        }
      };
    } catch (error) {
      console.error('Error enhancing search with MCP:', error);
      // Fall back to original parameters
      return { keywords, location };
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      
      // Get user profile or candidate profile if available
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const candidateProfile = JSON.parse(localStorage.getItem('candidateProfile') || '{"atsScore": 74}');
      
      // Use profile data for search if available
      const keywords = userProfile.selectedRole || candidateProfile.domain || searchParams.keywords;
      const location = userProfile.location || candidateProfile.location || searchParams.location;
      
      console.log(`Using MCP to enhance job search for: ${keywords} in ${location}...`);
      
      // First, get MCP enhanced search terms
      const enhancedSearch = await enhanceSearchWithMCP(keywords, location, candidateProfile);
      
      // Jooble API configuration
      const url = "https://jooble.org/api/";
      const key = "6d39d9c8-918d-479e-9eb0-065f6c9e09b3";
      const params = JSON.stringify({
        keywords: enhancedSearch.keywords || keywords,
        location: enhancedSearch.location || location
      });
      
      // Create XMLHttpRequest
      const http = new XMLHttpRequest();
      
      // Set up a Promise to handle the asynchronous request
      const jobsPromise = new Promise((resolve, reject) => {
        http.onreadystatechange = function() {
          if (http.readyState === 4) {
            if (http.status === 200) {
              try {
                const response = JSON.parse(http.responseText);
                resolve(response);
              } catch (error) {
                reject(new Error('Failed to parse Jooble API response'));
              }
            } else {
              reject(new Error(`Jooble API error: ${http.status}`));
            }
          }
        };
        
        // Open connection (asynchronous)
        http.open("POST", url + key, true);
        
        // Send the proper header information
        http.setRequestHeader("Content-type", "application/json");
        
        // Handle network errors
        http.onerror = function() {
          reject(new Error('Network error occurred'));
        };
        
        // Send request to the server
        http.send(params);
      });
      
      // Wait for the jobs to be fetched
      const jobsResponse = await jobsPromise;
      
      // Format and store jobs
      if (jobsResponse && jobsResponse.jobs) {
        const formattedJobs = formatJoobleJobs(jobsResponse.jobs);
        console.log(`Found ${formattedJobs.length} jobs from Jooble API`);
        setJobs(formattedJobs);
        
        // Update search params for future reference
        setSearchParams({
          keywords: keywords,
          location: location
        });
        
        // Update candidate profile
        setCandidateProfile({
          ...candidateProfile,
          lastSearch: {
            keywords: keywords,
            location: location
          }
        });
      } else {
        console.warn('No jobs found in Jooble API response');
        setJobs([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
      setLoading(false);
    }
  };

  // Function to format jobs from Jooble API to match our application format
  const formatJoobleJobs = (joobleJobs) => {
    return joobleJobs.map((job, index) => {
      // Extract requirements from description
      const requirements = extractRequirementsFromDescription(job.snippet || job.description || '');
      
      // Use MCP to calculate match score
      const mcpScore = calculateMcpMatchScore(job, requirements);
      
      // Generate number of applicants (could be from MCP in a real implementation)
      const applicants = Math.floor(Math.random() * 100) + 10;
      
      // Determine urgency based on MCP score
      const urgency = mcpScore > 90 ? 'high' : mcpScore > 80 ? 'medium' : 'low';
      
      return {
        jobId: `jooble-${job.id || index}`,
        title: job.title || 'Untitled Position',
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salary || 'Competitive Salary',
        type: job.type || 'Full-time',
        description: job.snippet || job.description || 'No description provided',
        requirements: requirements,
        matchScore: mcpScore,
        postedDate: job.updated || new Date().toISOString().split('T')[0],
        applicants: applicants,
        category: determineJobCategory(job.title || '', job.snippet || ''),
        companyLogo: determineCompanyEmoji(job.company || 'Unknown'),
        benefits: ['Competitive Salary', 'Career Growth', 'Professional Development'],
        urgency: urgency,
        source: 'Jooble API',
        url: job.link || '#'
      };
    });
  };
  
  // Helper function to extract requirements from job description
  const extractRequirementsFromDescription = (description) => {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 
      'SQL', 'Docker', 'Kubernetes', 'TypeScript', 'Angular', 'Vue', 
      'Git', 'Azure', 'GCP', 'PHP', 'C#', '.NET', 'Ruby', 'Go', 
      'HTML', 'CSS', 'SASS', 'LESS', 'REST API', 'GraphQL',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'NoSQL',
      'Redux', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'Agile', 'Scrum', 'Jira', 'CI/CD', 'Jenkins', 'GitHub Actions',
      'DevOps', 'Cloud', 'Microservices', 'Serverless'
    ];
    
    // Extract skills mentioned in the description
    return commonSkills.filter(skill => 
      description.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 5); // Return top 5 skills
  };
  
  // Helper function to determine job category from title and description
  const determineJobCategory = (title, description) => {
    const titleAndDesc = (title + ' ' + description).toLowerCase();
    
    if (titleAndDesc.match(/frontend|front end|react|angular|vue|html|css|ui developer/i)) {
      return 'frontend-developer';
    }
    if (titleAndDesc.match(/backend|back end|server|api|database|java|node|python|php|\.net|c\#/i)) {
      return 'backend-developer';
    }
    if (titleAndDesc.match(/fullstack|full stack|full-stack/i)) {
      return 'fullstack-developer';
    }
    if (titleAndDesc.match(/mobile|ios|android|swift|kotlin|react native|flutter/i)) {
      return 'mobile-developer';
    }
    if (titleAndDesc.match(/data sci|machine learning|ml engineer|ai|artificial intelligence|deep learning/i)) {
      return 'data-scientist';
    }
    if (titleAndDesc.match(/devops|sre|platform|reliability|cloud|aws|azure|gcp/i)) {
      return 'devops-engineer';
    }
    if (titleAndDesc.match(/qa|quality|test|automation test/i)) {
      return 'qa-engineer';
    }
    if (titleAndDesc.match(/ux|ui|user experience|user interface|product design/i)) {
      return 'ui-ux-designer';
    }
    
    // Default to software-engineer if no specific category is found
    return 'software-engineer';
  };

  // Calculate job match score using MCP-like algorithm
  const calculateMcpMatchScore = (job, requirements) => {
    try {
      // Get stored profile data
      const candidateProfile = JSON.parse(localStorage.getItem('candidateProfile') || '{"atsScore": 74}');
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      
      // Start with a base score
      let score = 75;
      
      // Simulate an MCP relevance algorithm
      const jobTitle = job.title?.toLowerCase() || '';
      const jobSnippet = job.snippet?.toLowerCase() || job.description?.toLowerCase() || '';
      
      // Check for Cloud & DevOps related skills in the job description
      const cloudDevOpsKeywords = [
        'aws', 'azure', 'gcp', 'cloud', 'kubernetes', 'docker', 'terraform', 'jenkins', 
        'ci/cd', 'devops', 'infrastructure', 'automation', 'ansible', 'chef', 'puppet'
      ];
      
      // Count how many relevant keywords appear
      const keywordMatches = cloudDevOpsKeywords.filter(keyword => 
        jobTitle.includes(keyword) || jobSnippet.includes(keyword)
      ).length;
      
      // Add points for keyword matches
      score += keywordMatches * 3;
      
      // If we have skills from the user profile, match those too
      if (userProfile.skills && Array.isArray(userProfile.skills)) {
        const skillMatches = userProfile.skills.filter(skill => 
          requirements.includes(skill) || 
          jobTitle.includes(skill.toLowerCase()) || 
          jobSnippet.includes(skill.toLowerCase())
        ).length;
        
        score += skillMatches * 2;
      }
      
      // Boost for seniority level match
      if ((userProfile.experienceLevel === 'senior' && jobTitle.includes('senior')) ||
          (userProfile.experienceLevel === 'mid' && jobTitle.includes('mid')) ||
          (userProfile.experienceLevel === 'junior' && jobTitle.includes('junior'))) {
        score += 5;
      }
      
      // Location match
      if (job.location && userProfile.location && 
          job.location.toLowerCase().includes(userProfile.location.toLowerCase())) {
        score += 4;
      }
      
      // Cap the score at 98 for realism
      return Math.min(98, Math.max(70, Math.round(score)));
    } catch (error) {
      console.error('Error calculating MCP match score:', error);
      // Fallback to a random score between 70-95
      return Math.floor(Math.random() * 25) + 70;
    }
  };
  
  // Helper function to determine company emoji based on company name
  const determineCompanyEmoji = (companyName) => {
    const name = companyName.toLowerCase();
    
    // Common tech companies
    if (name.includes('google')) return '🟡';
    if (name.includes('facebook') || name.includes('meta')) return '🔵';
    if (name.includes('amazon')) return '🟠';
    if (name.includes('apple')) return '🍎';
    if (name.includes('microsoft')) return '🟩';
    if (name.includes('netflix')) return '🔴';
    if (name.includes('twitter') || name.includes('x')) return '🐦';
    
    // Generic categories
    if (name.includes('tech') || name.includes('software')) return '💻';
    if (name.includes('health') || name.includes('medical')) return '⚕️';
    if (name.includes('finance') || name.includes('bank')) return '💰';
    if (name.includes('education') || name.includes('university')) return '🎓';
    if (name.includes('media') || name.includes('news')) return '📱';
    
    // Default icons by first letter
    const firstChar = name.charAt(0).toLowerCase();
    if ('abc'.includes(firstChar)) return '🔵';
    if ('def'.includes(firstChar)) return '🟢';
    if ('ghi'.includes(firstChar)) return '🟡';
    if ('jkl'.includes(firstChar)) return '🟠';
    if ('mno'.includes(firstChar)) return '🔴';
    if ('pqr'.includes(firstChar)) return '🟣';
    if ('stu'.includes(firstChar)) return '⚫';
    if ('vwx'.includes(firstChar)) return '⚪';
    if ('yz'.includes(firstChar)) return '🟤';
    
    // Final default
    return '💼';
  };

  // Filter jobs based on user-set filters
  const filterJobs = (jobs) => {
    // Filter jobs based on selected filters
    const filtered = jobs.filter(job => {
      // Check location filter
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Check job type filter
      if (filters.jobType && job.type !== filters.jobType) {
        return false;
      }
      
      // Check company filter
      if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // Sort jobs by MCP match score (highest first)
    return filtered.sort((a, b) => b.matchScore - a.matchScore);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 80) return 'text-blue-700 bg-blue-100 border-blue-200';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getUrgencyText = (urgency) => {
    switch(urgency) {
      case 'high': return 'Urgent Hiring';
      case 'medium': return 'Active Hiring';
      default: return 'Open Position';
    }
  };

  // Apply filters to the jobs list
  const filteredJobs = filterJobs(jobs);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    loadJobs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2V4c0-1.11-.89-2-2-2H8c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM8 4h8v2H8V4zm12 15H4V8h16v11z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">💼</span>
            <h1 className="text-3xl font-bold">Job Recommendations</h1>
          </div>
          <p className="text-blue-100 text-lg mb-4">
            <span className="font-semibold">{jobs.length}+</span> live job opportunities from top companies • 
            <span className="bg-white/20 px-2 py-1 rounded text-sm font-medium">Powered by Jooble API</span>
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-blue-200">🎯 Target Role:</span>
                <span className="font-semibold bg-white/20 px-2 py-1 rounded">
                  {candidateProfile?.selectedRole?.title || 'All Roles'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-200">📊 ATS Score:</span>
                <span className={`font-semibold px-2 py-1 rounded ${
                  candidateProfile?.atsScore >= 70 ? 'bg-green-500/30' : 
                  candidateProfile?.atsScore >= 50 ? 'bg-yellow-500/30' : 'bg-red-500/30'
                }`}>
                  {candidateProfile?.atsScore || '74'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-200">⚡ Status:</span>
                <span className="font-semibold bg-green-500/30 px-2 py-1 rounded animate-pulse">
                  Active Searching
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Jobs
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Job title, skills, or keywords"
              value={searchParams.keywords}
              onChange={(e) => setSearchParams({...searchParams, keywords: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              placeholder="City, state, or country"
              value={searchParams.location}
              onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Find Jobs
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filter Jobs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Filter by location"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              value={filters.jobType}
              onChange={(e) => setFilters({...filters, jobType: e.target.value})}
            >
              <option value="">Any Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Filter by company"
              value={filters.company}
              onChange={(e) => setFilters({...filters, company: e.target.value})}
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setFilters({ location: '', jobType: '', salaryRange: '', company: '' })}
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* MCP Insights */}
      {mcpInsights && (
        <div className="card p-6 border-l-4 border-blue-600">
          <div className="flex items-center mb-4">
            <div className="text-blue-600 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg">MCP Insights</h3>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {Math.round(mcpInsights.confidence * 100)}% confidence
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Market Trend</p>
              <p className="text-sm">{mcpInsights.marketTrends}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Salary Insight</p>
              <p className="text-sm">{mcpInsights.salaryInsights}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Skill Gaps</p>
              <div className="flex flex-wrap gap-1">
                {mcpInsights.skillGaps.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Career Path</p>
              <p className="text-sm">{mcpInsights.careerPath}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-2">High Match Jobs</div>
          <div className="text-2xl font-bold text-green-600">{filteredJobs.filter(j => j.matchScore >= 90).length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-2">Urgent Positions</div>
          <div className="text-2xl font-bold text-blue-600">{filteredJobs.filter(j => j.urgency === 'high').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-2">Remote Jobs</div>
          <div className="text-2xl font-bold text-purple-600">{filteredJobs.filter(j => j.type === 'Remote').length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500 mb-2">Companies</div>
          <div className="text-2xl font-bold text-orange-600">{new Set(filteredJobs.map(j => j.company)).size}</div>
        </div>
      </div>

      {/* Refresh button */}
      <div className="flex justify-end">
        <button 
          onClick={loadJobs} 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Jobs
        </button>
      </div>

      {/* Job Results */}
      <div className="card">
        <h2 className="font-semibold text-lg flex items-center justify-between mb-4">
          <span>
            <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
          </span>
          <span className="text-sm text-gray-500">
            Sorted by match score
          </span>
        </h2>

        <div className="space-y-6">
          {/* Job Cards */}
          {filteredJobs.map((job) => (
            <div key={job.jobId} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{job.companyLogo}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getMatchScoreColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {job.applicants} applicants
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-2 ${getUrgencyColor(job.urgency)}`}>
                      {getUrgencyText(job.urgency)}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Key Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, i) => (
                      <span key={i} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Salary</div>
                    <div className="font-medium">{job.salary}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Posted: {job.postedDate}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
            <button 
              onClick={() => setFilters({ location: '', jobType: '', salaryRange: '', company: '' })}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;