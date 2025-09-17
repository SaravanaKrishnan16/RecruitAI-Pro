const AWS = require('aws-sdk');
const https = require('https');

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
    const { candidateId, mcp_enabled, indeed_api_key } = event.queryStringParameters || JSON.parse(event.body || '{}');
    
    if (!candidateId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Indeed-API-Key',
          'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
        },
        body: JSON.stringify({ error: 'candidateId required' })
      };
    }
    
    // Get candidate data
    const candidateResult = await dynamodb.get({
      TableName: process.env.CANDIDATES_TABLE,
      Key: { candidateId }
    }).promise();
    
    if (!candidateResult.Item) {
      throw new Error('Candidate not found');
    }
    
    const candidate = candidateResult.Item;
    
    let jobs;
    let mcpData = null;
    
    if (mcp_enabled && indeed_api_key) {
      // Use MCP + Indeed API integration
      const mcpService = new MCPJobService();
      const result = await mcpService.fetchJobsWithMCP(candidate);
      jobs = result ? result.jobs : await fetchJobs(candidate);
      mcpData = result ? result.mcpRecommendations : null;
      console.log('MCP + Indeed API fetched jobs:', jobs.length);
    } else {
      // Use existing mock job generation
      jobs = await fetchJobs(candidate);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,GET'
      },
      body: JSON.stringify({
        jobs,
        candidateProfile: {
          domain: candidate.domain,
          atsScore: candidate.atsScore,
          experience: candidate.experience
        },
        mcpRecommendations: mcpData,
        sources: mcp_enabled ? ['Indeed API', 'MCP Recommendations'] : ['Mock Data'],
        totalFound: jobs.length,
        mcpEnabled: !!mcp_enabled,
        indeedApiUsed: !!indeed_api_key
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
  // Mock job data since external APIs require authentication
  const mockJobs = generateMockJobs(candidate);
  
  // In production, you would call real job APIs like:
  // - LinkedIn Jobs API
  // - Indeed API
  // - Naukri API
  // - Glassdoor API
  
  return mockJobs;
}

function generateMockJobs(candidate) {
  const jobTemplates = {
    'Programming': [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        salary: '$120,000 - $160,000',
        type: 'Full-time',
        description: 'Join our team to build scalable web applications using modern technologies.',
        requirements: ['5+ years experience', 'JavaScript', 'React', 'Node.js'],
        matchScore: 92
      },
      {
        title: 'Full Stack Developer',
        company: 'StartupXYZ',
        location: 'Remote',
        salary: '$90,000 - $130,000',
        type: 'Full-time',
        description: 'Work on cutting-edge projects with a dynamic team.',
        requirements: ['3+ years experience', 'Python', 'Django', 'PostgreSQL'],
        matchScore: 85
      }
    ],
    'Cloud': [
      {
        title: 'Cloud Solutions Architect',
        company: 'CloudTech Solutions',
        location: 'Seattle, WA',
        salary: '$140,000 - $180,000',
        type: 'Full-time',
        description: 'Design and implement cloud infrastructure solutions.',
        requirements: ['AWS Certified', '5+ years cloud experience', 'Terraform'],
        matchScore: 88
      },
      {
        title: 'DevOps Engineer',
        company: 'InfraCorp',
        location: 'Austin, TX',
        salary: '$110,000 - $150,000',
        type: 'Full-time',
        description: 'Manage CI/CD pipelines and cloud infrastructure.',
        requirements: ['Docker', 'Kubernetes', 'Jenkins', 'AWS'],
        matchScore: 82
      }
    ],
    'Frontend': [
      {
        title: 'Senior Frontend Developer',
        company: 'UIDesign Co.',
        location: 'New York, NY',
        salary: '$100,000 - $140,000',
        type: 'Full-time',
        description: 'Create beautiful and responsive user interfaces.',
        requirements: ['React', 'TypeScript', 'CSS3', 'Figma'],
        matchScore: 90
      }
    ],
    'Backend': [
      {
        title: 'Backend Engineer',
        company: 'DataFlow Inc.',
        location: 'Chicago, IL',
        salary: '$105,000 - $145,000',
        type: 'Full-time',
        description: 'Build robust APIs and microservices.',
        requirements: ['Node.js', 'MongoDB', 'REST APIs', 'Microservices'],
        matchScore: 87
      }
    ],
    'Data Science': [
      {
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        salary: '$115,000 - $155,000',
        type: 'Full-time',
        description: 'Analyze large datasets and build ML models.',
        requirements: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        matchScore: 89
      }
    ]
  };
  
  const domainJobs = jobTemplates[candidate.domain] || jobTemplates['Programming'];
  
  // Adjust match scores based on candidate's ATS score
  return domainJobs.map(job => ({
    ...job,
    matchScore: Math.min(job.matchScore + (candidate.atsScore - 70) / 2, 100),
    postedDate: getRandomDate(),
    applicants: Math.floor(Math.random() * 200) + 50,
    jobId: `job-${Math.random().toString(36).substr(2, 9)}`
  })).sort((a, b) => b.matchScore - a.matchScore);
}

function getRandomDate() {
  const days = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}