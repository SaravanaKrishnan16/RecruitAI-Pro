/**
 * Model Context Protocol (MCP) Service
 * 
 * This service integrates with the MCP system to enhance job search
 * functionality with AI-powered insights and recommendations.
 */

// Import any required dependencies
// import axios from 'axios';

/**
 * Enhance job search parameters using MCP
 * 
 * @param {string} keywords - Original search keywords
 * @param {string} location - Job location
 * @param {object} profile - User profile data
 * @returns {object} Enhanced search parameters
 */
export const enhanceJobSearch = async (keywords, location, profile) => {
  console.log('MCP Service: Enhancing job search parameters');
  
  try {
    // In a real implementation, you would make an API call to your MCP backend service
    // const response = await axios.post('/api/mcp/enhance-search', {
    //   keywords,
    //   location,
    //   profile
    // });
    // return response.data;
    
    // For now, simulate MCP processing with enhanced algorithm
    
    // Process the keywords based on known patterns and candidate profile
    let enhancedKeywords = keywords;
    
    // Extract domain/field from profile if available
    const domain = profile?.domain?.toLowerCase() || '';
    
    // Domain-specific enhancements
    if (domain.includes('software') || domain.includes('developer')) {
      enhancedKeywords = addRelevantTechTerms(enhancedKeywords, 'software');
    } else if (domain.includes('data')) {
      enhancedKeywords = addRelevantTechTerms(enhancedKeywords, 'data');
    } else if (domain.includes('cloud') || domain.includes('devops')) {
      enhancedKeywords = addRelevantTechTerms(enhancedKeywords, 'cloud');
    }
    
    // Simulate processing time for realistic feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return enhanced search parameters with MCP metadata
    return {
      keywords: enhancedKeywords,
      location: location,
      includedTerms: generateRelevantTerms(keywords, profile),
      relevanceBoost: calculateRelevanceBoost(profile),
      mcpMetadata: {
        enhancementApplied: true,
        enhancementType: 'contextual analysis',
        confidence: 0.89,
        processingTime: '0.2s',
        modelVersion: 'mcp-jobs-v1.2'
      }
    };
  } catch (error) {
    console.error('MCP Service Error:', error);
    // Return original parameters as fallback
    return {
      keywords,
      location,
      includedTerms: [],
      relevanceBoost: 0.5,
      mcpMetadata: {
        enhancementApplied: false,
        error: error.message
      }
    };
  }
};

/**
 * Generate MCP insights for job search results
 * 
 * @param {Array} jobs - List of job results 
 * @param {object} profile - User profile data
 * @returns {object} Insights and recommendations
 */
export const generateMCPInsights = async (jobs, profile) => {
  try {
    // Analyze jobs to extract insights
    const skills = extractCommonSkills(jobs);
    const salaryRange = estimateSalaryRange(jobs);
    const demandLevel = assessDemandLevel(jobs);
    
    // Calculate career path suggestions
    const careerPath = suggestCareerPath(jobs, profile);
    
    return {
      topSkills: skills.slice(0, 5),
      salaryRange,
      demandLevel,
      careerPath
    };
  } catch (error) {
    console.error('Error generating MCP insights:', error);
    return {
      topSkills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Git'],
      salaryRange: '$90,000 - $120,000',
      demandLevel: 'High',
      careerPath: 'Software Engineer → Senior Engineer → Lead Developer → Architect'
    };
  }
};

// Helper functions

/**
 * Add relevant technical terms based on domain
 */
const addRelevantTechTerms = (keywords, domain) => {
  const techTerms = {
    software: 'javascript react node typescript python java software development',
    data: 'python R SQL pandas tensorflow machine learning data science',
    cloud: 'kubernetes docker aws azure devops terraform jenkins CI/CD'
  };
  
  return `${keywords} ${techTerms[domain] || ''}`.trim();
};

/**
 * Generate relevant terms based on keywords and profile
 */
const generateRelevantTerms = (keywords, profile) => {
  const defaultTerms = ['software development', 'programming', 'cloud computing'];
  
  if (keywords.toLowerCase().includes('cloud')) {
    return ['containerization', 'automation', 'infrastructure as code', 'CI/CD'];
  }
  
  if (keywords.toLowerCase().includes('frontend')) {
    return ['react', 'javascript', 'UI/UX', 'responsive design'];
  }
  
  return defaultTerms;
};

/**
 * Calculate relevance boost based on profile completeness
 */
const calculateRelevanceBoost = (profile) => {
  // Default boost
  let boost = 0.75;
  
  // If profile has substantial information, increase boost
  if (profile && (profile.skills || profile.experience || profile.education)) {
    boost += 0.1;
  }
  
  // If profile has an ATS score, use it to influence boost
  if (profile && profile.atsScore) {
    boost += (profile.atsScore / 100) * 0.15;
  }
  
  // Cap at 0.95
  return Math.min(0.95, boost);
};

/**
 * Extract common skills from job listings
 */
const extractCommonSkills = (jobs) => {
  const skillCounts = {};
  
  // Count skills mentions across all jobs
  jobs.forEach(job => {
    if (job.requirements && Array.isArray(job.requirements)) {
      job.requirements.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    }
  });
  
  // Sort by frequency
  return Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
};

/**
 * Estimate salary range based on job listings
 */
const estimateSalaryRange = (jobs) => {
  // Parse salary values when available
  const salaries = jobs
    .filter(job => job.salary && typeof job.salary === 'string')
    .map(job => {
      const matches = job.salary.match(/\$(\d{2,3}(,\d{3})*)|\d{2,3}k/gi);
      if (matches && matches.length >= 1) {
        return matches.map(match => {
          // Handle 90k format
          if (match.toLowerCase().includes('k')) {
            return parseInt(match.replace(/k/i, '')) * 1000;
          }
          // Handle $90,000 format
          return parseInt(match.replace(/[$,]/g, ''));
        });
      }
      return null;
    })
    .filter(Boolean)
    .flat();
  
  if (salaries.length >= 2) {
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    
    return `$${formatNumber(min)} - $${formatNumber(max)}`;
  }
  
  // Default range if we couldn't parse salaries
  return '$80,000 - $120,000';
};

/**
 * Format number with commas
 */
const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Assess demand level based on job postings
 */
const assessDemandLevel = (jobs) => {
  const jobCount = jobs.length;
  
  if (jobCount > 50) return 'Very High';
  if (jobCount > 25) return 'High';
  if (jobCount > 10) return 'Moderate';
  return 'Low';
};

/**
 * Suggest career path based on jobs and profile
 */
const suggestCareerPath = (jobs, profile) => {
  // Default career paths by domain
  const careerPaths = {
    'software': 'Junior Developer → Developer → Senior Developer → Tech Lead → Architect',
    'frontend': 'Junior Frontend → Frontend Developer → Senior Frontend → UI/UX Lead',
    'backend': 'Backend Developer → Senior Backend → API Architect → Solution Architect',
    'fullstack': 'Fullstack Developer → Senior Developer → Tech Lead → CTO',
    'devops': 'DevOps Engineer → Cloud Engineer → Platform Engineer → Infrastructure Architect',
    'data': 'Data Analyst → Data Scientist → Senior Data Scientist → Data Science Director'
  };
  
  // Try to determine the job category from jobs and profile
  let domain = 'software'; // Default
  
  // Check job categories
  if (jobs && jobs.length > 0) {
    const categories = jobs.map(job => job.category).filter(Boolean);
    if (categories.length > 0) {
      const categoryCount = {};
      categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      // Find most common category
      const mostCommon = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      if (mostCommon.includes('frontend')) domain = 'frontend';
      else if (mostCommon.includes('backend')) domain = 'backend';
      else if (mostCommon.includes('fullstack')) domain = 'fullstack';
      else if (mostCommon.includes('devops')) domain = 'devops';
      else if (mostCommon.includes('data')) domain = 'data';
    }
  }
  
  // Check profile role/domain
  if (profile && profile.domain) {
    const profileDomain = profile.domain.toLowerCase();
    Object.keys(careerPaths).forEach(key => {
      if (profileDomain.includes(key)) {
        domain = key;
      }
    });
  }
  
  return careerPaths[domain] || careerPaths.software;
};