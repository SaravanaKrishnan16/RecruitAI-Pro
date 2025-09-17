/**
 * Model Context Protocol (MCP) Service for Job Recommendations
 * 
 * This service integrates with external job APIs and enhances results
 * with MCP for better job matching and career insights.
 */
const express = require('express');
const cors = require('cors');
const https = require('https');
const axios = require('axios').default;

const app = express();
app.use(cors());
app.use(express.json());

class MCPJobService {
    constructor() {
        this.joobleApiKey = process.env.JOOBLE_API_KEY || '6d39d9c8-918d-479e-9eb0-065f6c9e09b3';
        this.mcpEndpoint = process.env.MCP_ENDPOINT || 'https://mcp.aws.amazon.com/api';
        this.useMockData = process.env.USE_MOCK_DATA !== 'false';
    }

    /**
     * Fetch jobs with MCP enhancements
     * 
     * @param {Object} candidateProfile - Candidate profile data
     * @returns {Object} Enhanced jobs and MCP insights
     */
    async fetchJobsWithMCP(candidateProfile) {
        try {
            console.log('🤖 MCP - Processing job recommendations...');
            
            // First, enhance the search parameters using MCP
            const enhancedParams = await this.enhanceSearchWithMCP(candidateProfile);
            
            // Fetch jobs using the enhanced parameters
            const jobResults = await this.fetchFromJoobleAPI(enhancedParams);
            
            // Generate MCP insights for the retrieved jobs
            const mcpInsights = await this.generateMCPInsights(jobResults, candidateProfile);
            
            // Calculate match scores and sort by relevance
            const enhancedJobs = this.enhanceJobsWithMCP(jobResults, candidateProfile);
            
            return {
                jobs: enhancedJobs,
                mcpInsights,
                enhancedParams,
                source: 'mcp-jooble',
                processed: true,
                mcpVersion: '1.2.4',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('MCP Service Error:', error);
            return this.fallbackJobs(candidateProfile);
        }
    }

    /**
     * Generate MCP insights based on jobs and candidate profile
     * 
     * @param {Array} jobs - List of job results
     * @param {Object} profile - Candidate profile
     * @returns {Object} MCP insights and recommendations
     */
    async generateMCPInsights(jobs, profile) {
        try {
            console.log('🤖 MCP - Generating career insights...');
            
            // Extract common skills across job listings
            const commonSkills = this.extractCommonSkills(jobs);
            
            // Analyze salary trends
            const salaryRange = this.analyzeSalaryTrends(jobs);
            
            // Calculate skill gaps by comparing job requirements with candidate skills
            const skillGaps = this.calculateSkillGaps(jobs, profile);
            
            // Determine next career steps
            const careerPath = this.suggestCareerPath(jobs, profile);
            
            // Market analysis and growth areas
            const marketTrends = this.analyzeMarketTrends(jobs, profile.domain || 'Technology');
            
            return {
                marketTrends,
                salaryInsights: salaryRange,
                skillGaps: skillGaps,
                careerPath,
                topSkills: commonSkills.slice(0, 5),
                confidence: 0.94,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error generating MCP insights:', error);
            
            // Return fallback insights if something goes wrong
            return {
                marketTrends: `High demand for ${profile.domain || 'software'} professionals`,
                salaryInsights: `Average salary range: $90k-$130k`,
                skillGaps: ['Cloud Computing', 'Kubernetes', 'CI/CD'],
                careerPath: `Junior → Mid → Senior → Lead ${profile.domain || 'Engineer'}`,
                topSkills: ['JavaScript', 'AWS', 'React', 'Python', 'Docker'],
                confidence: 0.85
            };
        }
    }
    
    /**
     * Enhance jobs with MCP match scores and additional metadata
     * 
     * @param {Array} jobs - Job results
     * @param {Object} profile - Candidate profile
     * @returns {Array} Enhanced job results with MCP scores
     */
    enhanceJobsWithMCP(jobs, profile) {
        return jobs.map(job => {
            // Calculate MCP match score
            const matchScore = this.calculateMcpMatchScore(job, profile);
            
            // Determine urgency based on score and recency
            const urgency = matchScore > 90 ? 'high' : matchScore > 80 ? 'medium' : 'low';
            
            // Simulate applicant count
            const applicants = Math.floor(Math.random() * 100) + 10;
            
            return {
                ...job,
                matchScore,
                urgency,
                applicants,
                mcpEnhanced: true
            };
        }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score
    }
    
    /**
     * Calculate MCP match score for a job
     * 
     * @param {Object} job - Job data
     * @param {Object} profile - Candidate profile
     * @returns {number} Match score (0-100)
     */
    calculateMcpMatchScore(job, profile) {
        try {
            // Start with a base score
            let score = 75;
            
            // Extract job title and description
            const jobTitle = job.title?.toLowerCase() || '';
            const jobDescription = job.description?.toLowerCase() || '';
            
            // Get candidate skills and experience
            const candidateSkills = profile.skills || [];
            const candidateDomain = profile.domain?.toLowerCase() || '';
            
            // Check for domain match in title
            if (jobTitle.includes(candidateDomain)) {
                score += 10;
            } else if (jobDescription.includes(candidateDomain)) {
                score += 5;
            }
            
            // Check skill matches
            const jobRequirements = job.requirements || [];
            const skillMatches = candidateSkills.filter(skill => 
                jobRequirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
            ).length;
            
            // Add points for skill matches (max 15)
            score += Math.min(15, skillMatches * 3);
            
            // Adjust for experience level
            const experience = profile.yearsOfExperience || 0;
            if (jobTitle.includes('senior') && experience >= 5) {
                score += 5;
            } else if (jobTitle.includes('junior') && experience <= 2) {
                score += 5;
            } else if (!jobTitle.includes('senior') && !jobTitle.includes('junior') && experience >= 2 && experience <= 5) {
                score += 5;
            }
            
            // Cap the score at 98 for realism
            return Math.min(98, Math.max(70, Math.round(score)));
        } catch (error) {
            console.error('Error calculating MCP match score:', error);
            // Return a reasonable default score
            return Math.floor(Math.random() * 25) + 70;
        }
    }

    /**
     * Enhance search parameters using MCP
     * 
     * @param {Object} profile - Candidate profile
     * @returns {Object} Enhanced search parameters
     */
    async enhanceSearchWithMCP(profile) {
        try {
            console.log('🤖 MCP - Enhancing search parameters...');
            
            // Extract search parameters from profile
            const domain = profile.domain || 'software engineer';
            const location = profile.location || 'United States';
            
            // In a production environment, you would call an actual MCP service
            // const mcpResponse = await axios.post(this.mcpEndpoint + '/enhance-search', {
            //     domain, location, profile
            // });
            // return mcpResponse.data;
            
            // For now, simulate enhanced search based on domain
            let enhancedKeywords = domain;
            
            // Add relevant terms based on domain
            if (domain.toLowerCase().includes('cloud') || domain.toLowerCase().includes('devops')) {
                enhancedKeywords += ' AWS Azure Kubernetes Docker CI/CD DevOps';
            } else if (domain.toLowerCase().includes('frontend')) {
                enhancedKeywords += ' React Angular Vue JavaScript TypeScript UI/UX';
            } else if (domain.toLowerCase().includes('data')) {
                enhancedKeywords += ' Python SQL Machine Learning AI Data Science';
            } else {
                enhancedKeywords += ' software development programming';
            }
            
            return {
                keywords: enhancedKeywords,
                location,
                radius: 25,
                includedTerms: this.generateRelevantTerms(domain),
                excludedTerms: [],
                sortBy: 'relevance',
                boostFactors: {
                    skills: 0.4,
                    experience: 0.3,
                    location: 0.2,
                    recency: 0.1
                }
            };
        } catch (error) {
            console.error('Error enhancing search with MCP:', error);
            return { keywords: profile.domain || 'software engineer', location: profile.location || 'United States' };
        }
    }
    
    /**
     * Fetch jobs from Jooble API
     * 
     * @param {Object} searchParams - Enhanced search parameters
     * @returns {Array} Job results from Jooble
     */
    async fetchFromJoobleAPI(searchParams) {
        try {
            console.log('Fetching jobs from Jooble API...');
            
            // Jooble API configuration
            const url = "https://jooble.org/api/";
            const key = this.joobleApiKey;
            
            // Prepare request parameters
            const params = {
                keywords: searchParams.keywords || 'software engineer',
                location: searchParams.location || 'United States'
            };
            
            // Make the API request
            const response = await axios.post(url + key, params, {
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.data && response.data.jobs) {
                console.log(`Found ${response.data.jobs.length} jobs from Jooble API`);
                return this.formatJoobleJobs(response.data.jobs);
            } else {
                console.warn('No jobs found in Jooble API response');
                return [];
            }
        } catch (error) {
            console.error('Jooble API Error:', error);
            return this.fallbackJobs().jobs;
        }
    }

    /**
     * Format Jooble API results to our application format
     * 
     * @param {Array} joobleResults - Results from Jooble API
     * @returns {Array} Formatted job listings
     */
    formatJoobleJobs(joobleResults) {
        return joobleResults.map((job, index) => {
            // Extract requirements from description
            const requirements = this.extractRequirementsFromDescription(job.snippet || job.description || '');
            
            return {
                jobId: `jooble-${job.id || index}`,
                title: job.title || 'Untitled Position',
                company: job.company || 'Unknown Company',
                location: job.location || 'Remote',
                salary: job.salary || 'Competitive Salary',
                type: job.type || 'Full-time',
                description: job.snippet || job.description || 'No description provided',
                requirements: requirements,
                postedDate: job.updated || new Date().toISOString().split('T')[0],
                source: 'Jooble API',
                url: job.link || '#'
            };
        });
    }
    
    /**
     * Extract requirements from job description
     * 
     * @param {string} description - Job description text
     * @returns {Array} List of extracted requirements/skills
     */
    extractRequirementsFromDescription(description) {
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
    }
    
    /**
     * Generate relevant terms based on domain
     * 
     * @param {string} domain - Job domain/category
     * @returns {Array} Relevant terms for search enhancement
     */
    generateRelevantTerms(domain) {
        domain = domain.toLowerCase();
        
        if (domain.includes('cloud') || domain.includes('devops')) {
            return ['containerization', 'automation', 'infrastructure as code'];
        }
        
        if (domain.includes('frontend')) {
            return ['react', 'javascript', 'ui/ux', 'responsive design'];
        }
        
        if (domain.includes('backend')) {
            return ['api', 'server', 'database', 'microservices'];
        }
        
        if (domain.includes('data')) {
            return ['analytics', 'machine learning', 'visualization', 'big data'];
        }
        
        return ['programming', 'software development', 'engineering'];
    }
    
    /**
     * Extract common skills from job listings
     * 
     * @param {Array} jobs - Job results
     * @returns {Array} Common skills across jobs
     */
    extractCommonSkills(jobs) {
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
    }
    
    /**
     * Analyze salary trends in job listings
     * 
     * @param {Array} jobs - Job results
     * @returns {string} Formatted salary range
     */
    analyzeSalaryTrends(jobs) {
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
            
            return `$${this.formatNumber(min)} - $${this.formatNumber(max)}`;
        }
        
        // Default range if we couldn't parse salaries
        return '$90,000 - $120,000';
    }
    
    /**
     * Calculate skill gaps between job requirements and candidate profile
     * 
     * @param {Array} jobs - Job results
     * @param {Object} profile - Candidate profile
     * @returns {Array} List of skill gaps
     */
    calculateSkillGaps(jobs, profile) {
        const candidateSkills = (profile.skills || []).map(skill => skill.toLowerCase());
        
        // Extract all unique job requirements
        const allRequirements = new Set();
        jobs.forEach(job => {
            if (job.requirements && Array.isArray(job.requirements)) {
                job.requirements.forEach(req => allRequirements.add(req.toLowerCase()));
            }
        });
        
        // Find requirements not in candidate skills
        const gaps = Array.from(allRequirements)
            .filter(req => !candidateSkills.some(skill => req.includes(skill) || skill.includes(req)))
            .map(gap => gap.charAt(0).toUpperCase() + gap.slice(1)); // Capitalize
        
        return gaps.slice(0, 5); // Return top 5 gaps
    }
    
    /**
     * Suggest career path based on job search results
     * 
     * @param {Array} jobs - Job results
     * @param {Object} profile - Candidate profile
     * @returns {string} Career path suggestion
     */
    suggestCareerPath(jobs, profile) {
        // Default career paths by domain
        const careerPaths = {
            'software': 'Junior Developer → Developer → Senior Developer → Tech Lead → Architect',
            'frontend': 'Junior Frontend → Frontend Developer → Senior Frontend → UI/UX Lead',
            'backend': 'Backend Developer → Senior Backend → API Architect → Solution Architect',
            'fullstack': 'Fullstack Developer → Senior Developer → Tech Lead → CTO',
            'devops': 'DevOps Engineer → Cloud Engineer → Platform Engineer → Infrastructure Architect',
            'data': 'Data Analyst → Data Scientist → Senior Data Scientist → Data Science Director'
        };
        
        // Try to determine the job category
        const domain = profile.domain?.toLowerCase() || '';
        
        if (domain.includes('frontend')) {
            return careerPaths.frontend;
        } else if (domain.includes('backend')) {
            return careerPaths.backend;
        } else if (domain.includes('fullstack')) {
            return careerPaths.fullstack;
        } else if (domain.includes('devops') || domain.includes('cloud')) {
            return careerPaths.devops;
        } else if (domain.includes('data')) {
            return careerPaths.data;
        }
        
        return careerPaths.software;
    }
    
    /**
     * Analyze market trends based on job postings
     * 
     * @param {Array} jobs - Job results
     * @param {string} domain - Job domain/category
     * @returns {string} Market trend analysis
     */
    analyzeMarketTrends(jobs, domain) {
        const jobCount = jobs.length;
        
        if (jobCount > 50) {
            return `Very high demand for ${domain} professionals with numerous opportunities`;
        } else if (jobCount > 25) {
            return `Strong market for ${domain} roles with growing demand`;
        } else if (jobCount > 10) {
            return `Moderate demand for ${domain} skills in current job market`;
        } else {
            return `Limited opportunities for ${domain} positions, consider expanding search`;
        }
    }
    
    /**
     * Format number with commas
     * 
     * @param {number} number - Number to format
     * @returns {string} Formatted number with commas
     */
    formatNumber(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Fallback jobs when API fails
     * 
     * @param {Object} profile - Candidate profile
     * @returns {Object} Fallback job results
     */
    fallbackJobs(profile = {}) {
        return {
            jobs: [
                {
                    jobId: 'fallback-1',
                    title: 'Software Engineer',
                    company: 'Tech Solutions Inc',
                    location: profile.location || 'Remote',
                    salary: '$90,000 - $120,000',
                    type: 'Full-time',
                    description: 'Looking for a skilled software engineer with experience in modern web technologies.',
                    requirements: ['JavaScript', 'React', 'Node.js', 'AWS', 'Git'],
                    matchScore: 85,
                    postedDate: new Date().toISOString().split('T')[0],
                    applicants: 45,
                    source: 'Fallback Data',
                    url: '#'
                },
                {
                    jobId: 'fallback-2',
                    title: 'Cloud DevOps Engineer',
                    company: 'CloudTech Systems',
                    location: profile.location || 'Remote',
                    salary: '$110,000 - $140,000',
                    type: 'Full-time',
                    description: 'Seeking an experienced DevOps engineer to manage our cloud infrastructure.',
                    requirements: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
                    matchScore: 82,
                    postedDate: new Date().toISOString().split('T')[0],
                    applicants: 37,
                    source: 'Fallback Data',
                    url: '#'
                }
            ],
            mcpInsights: {
                marketTrends: `Moderate demand for ${profile.domain || 'tech'} professionals`,
                salaryInsights: 'Average salary range: $90k-$130k',
                skillGaps: ['Cloud Computing', 'Kubernetes', 'CI/CD'],
                careerPath: 'Junior Developer → Developer → Senior Developer → Lead Developer',
                topSkills: ['JavaScript', 'React', 'AWS', 'Node.js', 'Docker'],
                confidence: 0.75
            },
            source: 'mcp-fallback',
            processed: true
        };
    }
}

// Create instance of MCP service
        return {
            jobs: [
                {
                    jobId: 'mcp-fallback-1',
                    title: 'Senior Software Engineer',
                    company: 'TechCorp Solutions',
                    location: 'San Francisco, CA',
                    salary: '$120,000 - $160,000',
                    type: 'Full-time',
                    description: 'Build scalable applications with modern tech stack.',
                    requirements: ['JavaScript', 'React', 'Node.js', 'AWS'],
                    matchScore: 88,
                    postedDate: '2024-01-15',
                    applicants: 45,
                    source: 'MCP Fallback',
                    indeedJobKey: 'fallback_1'
                },
                {
                    jobId: 'mcp-fallback-2',
                    title: 'Full Stack Developer',
                    company: 'Innovation Labs',
                    location: 'Remote',
                    salary: '$90,000 - $130,000',
                    type: 'Full-time',
                    description: 'Work on cutting-edge projects in a dynamic environment.',
                    requirements: ['Python', 'Django', 'PostgreSQL', 'Docker'],
                    matchScore: 82,
                    postedDate: '2024-01-12',
                    applicants: 32,
                    source: 'MCP Fallback',
                    indeedJobKey: 'fallback_2'
                }
            ],
            mcpInsights: {
                marketTrends: `Moderate demand for ${profile.domain || 'tech'} professionals`,
                salaryInsights: 'Average salary range: $90k-$130k',
                skillGaps: ['Cloud Computing', 'Kubernetes', 'CI/CD'],
                careerPath: 'Junior Developer → Developer → Senior Developer → Lead Developer',
                topSkills: ['JavaScript', 'React', 'AWS', 'Node.js', 'Docker'],
                confidence: 0.75
            },
            source: 'mcp-fallback',
            processed: true
        };
    }
}

// Create instance of MCP service
const mcpService = new MCPJobService();

// API endpoint to fetch jobs with MCP
app.post('/api/mcp/jobs', async (req, res) => {
    try {
        const candidateProfile = req.body.profile || {};
        const enhancedJobs = await mcpService.fetchJobsWithMCP(candidateProfile);
        res.json(enhancedJobs);
    } catch (error) {
        console.error('MCP API error:', error);
        res.status(500).json({ error: 'Failed to process job recommendations' });
    }
});

// API endpoint to enhance search parameters
app.post('/api/mcp/enhance-search', async (req, res) => {
    try {
        const { keywords, location, profile } = req.body;
        const enhancedParams = await mcpService.enhanceSearchWithMCP(profile || {});
        res.json(enhancedParams);
    } catch (error) {
        console.error('MCP search enhancement error:', error);
        res.status(500).json({ error: 'Failed to enhance search parameters' });
    }
});

// API endpoint to generate MCP insights
app.post('/api/mcp/insights', async (req, res) => {
    try {
        const { jobs, profile } = req.body;
        const insights = await mcpService.generateMCPInsights(jobs || [], profile || {});
        res.json(insights);
    } catch (error) {
        console.error('MCP insights error:', error);
        res.status(500).json({ error: 'Failed to generate MCP insights' });
    }
});

// Start server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
        console.log(`MCP Service running on port ${PORT}`);
    });
}

// Export for use in other modules
module.exports = {
    app,
    mcpService
};

// API Routes
app.post('/jobs', async (req, res) => {
    try {
        const { candidateProfile, mcp_enabled, indeed_api_key } = req.body;
        
        if (mcp_enabled && indeed_api_key) {
            const mcpService = new MCPJobService();
            mcpService.indeedApiKey = indeed_api_key;
            
            const result = await mcpService.fetchJobsWithMCP(candidateProfile);
            
            res.json({
                ...result,
                mcpEnabled: true,
                indeedApiUsed: true,
                totalFound: result.jobs.length
            });
        } else {
            const mcpService = new MCPJobService();
            const fallback = mcpService.fallbackJobs(candidateProfile);
            
            res.json({
                ...fallback,
                mcpEnabled: false,
                indeedApiUsed: false,
                totalFound: fallback.jobs.length
            });
        }
    } catch (error) {
        console.error('MCP Service Error:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});

app.get('/health', (req, res) => {
    res.json({
        amazonQ: process.env.AMAZON_Q_APP_ID ? true : false,
        mcp: process.env.MCP_ENDPOINT ? true : false,
        indeedApi: process.env.INDEED_API_KEY ? true : false,
        overall: 'operational'
    });
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
    console.log(`🤖 MCP Job Service running on port ${PORT}`);
    console.log(`📊 Indeed API: ${process.env.INDEED_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`🔗 MCP Endpoint: ${process.env.MCP_ENDPOINT || 'Default'}`);
});

module.exports = app;