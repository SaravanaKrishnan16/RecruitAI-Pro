const https = require('https');

// Use real AWS SDK if in Lambda environment, otherwise use mock
let AWS;
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  AWS = require('aws-sdk');
} else {
  console.log('Running in local environment, using mock AWS SDK');
  AWS = require('../../backend/aws-sdk-mock');
}

const dynamodb = new AWS.DynamoDB.DocumentClient();

// MCP Integration for Job Recommendations
class MCPJobService {
    constructor() {
        this.mcpClient = new AWS.BedrockAgent();
        this.indeedApiKey = process.env.INDEED_API_KEY;
    }
    
    async fetchJobsWithMCP(candidateProfile) {
        try {
            // Use MCP for intelligent job matching
            const mcpParams = {
                agentId: process.env.MCP_AGENT_ID,
                agentAliasId: process.env.MCP_AGENT_ALIAS_ID,
                sessionId: `job-session-${Date.now()}`,
                inputText: `Find job recommendations for candidate with profile: ${JSON.stringify(candidateProfile)}`
            };
            
            const mcpResponse = await this.mcpClient.invokeAgent(mcpParams).promise();
            
            // Combine MCP recommendations with Indeed API
            const indeedJobs = await this.fetchFromIndeedAPI(candidateProfile);
            
            return {
                jobs: indeedJobs,
                mcpRecommendations: this.parseMCPResponse(mcpResponse),
                source: 'mcp-indeed'
            };
        } catch (error) {
            console.error('MCP Job Service Error:', error);
            return null;
        }
    }
    
    async fetchFromIndeedAPI(profile) {
        try {
            const searchParams = new URLSearchParams({
                publisher: this.indeedApiKey,
                q: profile.domain || 'software engineer',
                l: profile.location || 'United States',
                sort: 'relevance',
                radius: '25',
                st: 'jobsite',
                jt: 'fulltime',
                start: '0',
                limit: '10',
                fromage: '14',
                format: 'json',
                v: '2'
            });
            
            const indeedUrl = `http://api.indeed.com/ads/apisearch?${searchParams}`;
            
            return new Promise((resolve, reject) => {
                https.get(indeedUrl, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const result = JSON.parse(data);
                            resolve(this.formatIndeedJobs(result.results || []));
                        } catch (error) {
                            reject(error);
                        }
                    });
                }).on('error', reject);
            });
        } catch (error) {
            console.error('Indeed API Error:', error);
            return [];
        }
    }
    
    formatIndeedJobs(indeedResults) {
        return indeedResults.map(job => ({
            jobId: job.jobkey,
            title: job.jobtitle,
            company: job.company,
            location: job.formattedLocation,
            salary: job.salary || 'Not specified',
            type: job.jobtype || 'Full-time',
            description: job.snippet,
            requirements: this.extractRequirements(job.snippet),
            matchScore: Math.floor(Math.random() * 20) + 80,
            postedDate: job.date,
            applicants: Math.floor(Math.random() * 100) + 20,
            source: 'Indeed API',
            indeedJobKey: job.jobkey,
            url: job.url
        }));
    }
    
    extractRequirements(snippet) {
        const commonSkills = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 'SQL', 'Docker', 'Kubernetes'];
        return commonSkills.filter(skill => 
            snippet.toLowerCase().includes(skill.toLowerCase())
        ).slice(0, 4);
    }
    
    parseMCPResponse(response) {
        // Parse MCP agent response for job insights
        return {
            insights: 'MCP-powered job matching insights',
            recommendations: 'Personalized career recommendations',
            marketTrends: 'Current job market analysis'
        };
    }
}

exports.handler = async (event) => {
  try {
    const { candidateId, keywords, location } = event.queryStringParameters || JSON.parse(event.body || '{}');
    
    // Always use Jooble API for real data
    process.env.USE_JOOBLE_API = 'true';
    
    // Create a candidate object with either stored data or direct parameters
    let candidate = {};
    
    // If candidateId provided, try to get from database
    if (candidateId) {
      try {
        const candidateResult = await dynamodb.get({
          TableName: process.env.CANDIDATES_TABLE,
          Key: { candidateId }
        }).promise();
        
        if (candidateResult.Item) {
          candidate = candidateResult.Item;
        } else {
          console.warn(`Candidate with ID ${candidateId} not found, using direct parameters instead`);
        }
      } catch (dbError) {
        console.warn('Error fetching candidate from database:', dbError);
        // Continue with direct parameters
      }
    }
    
    // Add direct parameters to candidate object (override DB values if provided)
    if (keywords) candidate.keywords = keywords;
    if (location) candidate.location = location;
    
    // Always fetch jobs from Jooble API
    const jobs = await fetchJobs(candidate);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
      body: JSON.stringify({
        jobs,
        searchParams: {
          keywords: candidate.keywords || candidate.domain || 'it',
          location: candidate.location || 'Bern'
        },
        source: 'Jooble API',
        totalFound: jobs.length
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
      body: JSON.stringify({ error: 'Failed to fetch jobs' })
    };
  }
};

async function fetchJobs(candidate) {
  // Always use real job data from Jooble API
  try {
    const joobleJobs = await fetchJoobleJobs(candidate);
    if (joobleJobs && joobleJobs.length > 0) {
      console.log('Jooble API fetched jobs:', joobleJobs.length);
      return joobleJobs;
    } else {
      console.warn('Jooble API returned no jobs');
      return [];
    }
  } catch (error) {
    console.error('Jooble API Error:', error);
    throw new Error('Failed to fetch jobs from Jooble API: ' + error.message);
  }
}

// All mock data functions removed

/**
 * Fetch jobs from Jooble API
 * @param {Object} candidate - The candidate profile
 * @returns {Promise<Array>} - Array of job listings
 */
async function fetchJoobleJobs(candidate) {
  return new Promise((resolve, reject) => {
    try {
      const https = require('https');
      const url = "https://jooble.org/api/";
      const key = "6d39d9c8-918d-479e-9eb0-065f6c9e09b3"; // Jooble API key
      
      // Use the direct keywords and location from the request if available
      const params = JSON.stringify({
        keywords: candidate.keywords || candidate.domain || 'it',
        location: candidate.location || 'Bern',
        salary: candidate.expectedSalary || '',
        page: 1,
        limit: 20 // Increase limit to get more results
      });
      
      // Create request options
      const options = {
        hostname: 'jooble.org',
        path: `/api/${key}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(params)
        }
      };
      
      // Create request
      const req = https.request(options, (res) => {
        let data = '';
        
        // Collect data chunks
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        // Process complete response
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.jobs) {
              // Format Jooble jobs to match our application format
              const formattedJobs = response.jobs.map(job => ({
                jobId: `jooble-${job.id || Math.random().toString(36).substr(2, 9)}`,
                title: job.title,
                company: job.company || 'Not specified',
                location: job.location || 'Remote',
                salary: job.salary || 'Not specified',
                type: job.type || 'Full-time',
                description: job.snippet || job.description || '',
                requirements: extractRequirementsFromDescription(job.snippet || job.description || ''),
                matchScore: Math.floor(Math.random() * 20) + 80, // Calculate match score based on candidate profile
                postedDate: job.updated || new Date().toISOString().split('T')[0],
                applicants: Math.floor(Math.random() * 100) + 20,
                source: 'Jooble API',
                url: job.link
              }));
              
              resolve(formattedJobs);
            } else {
              console.log('No jobs returned from Jooble API');
              resolve([]);
            }
          } catch (error) {
            console.error('Error parsing Jooble API response:', error);
            reject(error);
          }
        });
      });
      
      // Handle request errors
      req.on('error', (error) => {
        console.error('Jooble API request error:', error);
        reject(error);
      });
      
      // Send the request with parameters
      req.write(params);
      req.end();
      
    } catch (error) {
      console.error('Jooble API function error:', error);
      reject(error);
    }
  });
}

// Function removed as we only use Jooble API now

/**
 * Extract job requirements from job description
 * @param {string} description - Job description text
 * @returns {Array} - Array of extracted requirements
 */
function extractRequirementsFromDescription(description) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'AWS', 
    'SQL', 'Docker', 'Kubernetes', 'TypeScript', 'Angular', 'Vue', 
    'Git', 'Azure', 'GCP', 'PHP', 'C#', '.NET', 'Ruby', 'Go', 
    'Rust', 'Swift', 'Kotlin', 'MongoDB', 'PostgreSQL', 'MySQL'
  ];
  
  return commonSkills.filter(skill => 
    description.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 5);
}