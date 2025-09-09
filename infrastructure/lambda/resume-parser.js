const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const textract = new AWS.Textract();
const comprehend = new AWS.Comprehend();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const { resumeUrl, candidateId } = JSON.parse(event.body);
    
    // Extract text from resume using Textract
    const textractParams = {
      Document: {
        S3Object: {
          Bucket: process.env.RESUME_BUCKET,
          Name: resumeUrl.split('/').pop()
        }
      }
    };
    
    const textractResult = await textract.detectDocumentText(textractParams).promise();
    const extractedText = textractResult.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join(' ');

    // Extract skills using Comprehend
    const comprehendParams = {
      Text: extractedText,
      LanguageCode: 'en'
    };
    
    const entitiesResult = await comprehend.detectEntities(comprehendParams).promise();
    const keyPhrasesResult = await comprehend.detectKeyPhrases(comprehendParams).promise();
    
    // Process skills and experience
    const skills = extractSkills(extractedText, entitiesResult.Entities, keyPhrasesResult.KeyPhrases);
    const experience = extractExperience(extractedText);
    const atsScore = calculateATSScore(extractedText, skills);
    const domain = determineDomain(skills);
    
    // Store candidate data
    const candidateData = {
      candidateId: candidateId || uuidv4(),
      resumeText: extractedText,
      skills,
      experience,
      atsScore,
      domain,
      createdAt: new Date().toISOString()
    };
    
    await dynamodb.put({
      TableName: process.env.CANDIDATES_TABLE,
      Item: candidateData
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({
        candidateId: candidateData.candidateId,
        skills,
        experience,
        atsScore,
        domain
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({ error: 'Failed to parse resume' })
    };
  }
};

function extractSkills(text, entities, keyPhrases) {
  const skillKeywords = {
    'Programming': ['javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift'],
    'Cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'cloudformation', 'lambda', 's3', 'ec2'],
    'Database': ['mysql', 'postgresql', 'mongodb', 'redis', 'dynamodb', 'oracle', 'sql server', 'cassandra'],
    'DevOps': ['jenkins', 'gitlab', 'github actions', 'ansible', 'puppet', 'chef', 'nagios', 'prometheus'],
    'Frontend': ['html', 'css', 'sass', 'bootstrap', 'tailwind', 'webpack', 'vite', 'figma'],
    'Backend': ['express', 'fastapi', 'django', 'flask', 'spring boot', 'laravel', 'rails'],
    'Mobile': ['react native', 'flutter', 'ionic', 'xamarin', 'android', 'ios', 'swift', 'kotlin'],
    'Data Science': ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'jupyter', 'r', 'tableau'],
    'Testing': ['jest', 'cypress', 'selenium', 'junit', 'pytest', 'mocha', 'chai'],
    'Other': ['git', 'linux', 'agile', 'scrum', 'jira', 'confluence', 'slack', 'teams']
  };
  
  const foundSkills = {};
  const lowerText = text.toLowerCase();
  
  Object.entries(skillKeywords).forEach(([category, keywords]) => {
    foundSkills[category] = keywords.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
  });
  
  return foundSkills;
}

function extractExperience(text) {
  const experienceRegex = /(\d+)[\s\-\+]*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi;
  const matches = text.match(experienceRegex);
  
  if (matches && matches.length > 0) {
    const years = matches[0].match(/\d+/);
    return years ? parseInt(years[0]) : 0;
  }
  
  return 0;
}

function calculateATSScore(text, skills) {
  let score = 0;
  const totalSkills = Object.values(skills).flat().length;
  
  // Base score from skills
  score += Math.min(totalSkills * 5, 40);
  
  // Keywords presence
  const keywords = ['experience', 'project', 'team', 'leadership', 'management', 'development'];
  keywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) score += 5;
  });
  
  // Length and structure
  if (text.length > 1000) score += 10;
  if (text.length > 2000) score += 10;
  
  return Math.min(score, 100);
}

function determineDomain(skills) {
  const domainScores = {};
  
  Object.entries(skills).forEach(([category, skillList]) => {
    if (skillList.length > 0) {
      domainScores[category] = skillList.length;
    }
  });
  
  const topDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topDomain ? topDomain[0] : 'General';
}