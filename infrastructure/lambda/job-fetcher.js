const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { candidateId } = event.queryStringParameters || {};
    
    if (!candidateId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'OPTIONS,GET'
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
    
    // Fetch jobs based on candidate profile
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
        candidateProfile: {
          domain: candidate.domain,
          atsScore: candidate.atsScore,
          experience: candidate.experience
        }
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