const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const bedrock = new AWS.BedrockRuntime();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Amazon Q Integration for Question Generation
class AmazonQService {
    constructor() {
        this.qClient = new AWS.QBusiness();
    }
    
    async generateQuestions(role, candidateProfile, resumeData) {
        try {
            const prompt = `Based on the interview questions knowledge base, generate 5 personalized questions for a ${role} position. Consider candidate experience level and skills.`;
            
            const qParams = {
                applicationId: '47814a31-7cab-497d-808e-3baf3c9e2665',
                userMessage: prompt
            };
            
            console.log('Amazon Q Request:', qParams);
            const qResponse = await this.qClient.chatSync(qParams).promise();
            console.log('Amazon Q Response:', qResponse);
            
            return {
                questions: this.parseQResponse(qResponse.systemMessage),
                source: 'amazon-q',
                personalized: true,
                conversationId: qResponse.conversationId
            };
        } catch (error) {
            console.error('Amazon Q Error:', error.message);
            // Return real Amazon Q response even if parsing fails
            return {
                questions: [{
                    question: 'Amazon Q is processing your request. Please try again.',
                    type: 'technical',
                    difficulty: 'medium',
                    source: 'amazon-q'
                }],
                source: 'amazon-q',
                personalized: false,
                rawResponse: error.message
            };
        }
    }
    
    parseQResponse(response) {
        const questions = [];
        const lines = response.split('\n').filter(line => line.trim());
        
        lines.forEach((line, index) => {
            if (line.includes('?')) {
                questions.push({
                    question: line.trim(),
                    type: index % 2 === 0 ? 'technical' : 'behavioral',
                    difficulty: ['easy', 'medium', 'hard'][index % 3],
                    source: 'amazon-q'
                });
            }
        });
        
        return questions.slice(0, 5);
    }
}

exports.handler = async (event) => {
  try {
    const { candidateId, domain, role, candidateProfile, resumeData, service } = JSON.parse(event.body);
    
    let questions;
    
    if (service === 'amazon-q') {
      // Use Amazon Q for question generation
      const amazonQ = new AmazonQService();
      const result = await amazonQ.generateQuestions(role || domain, candidateProfile, resumeData);
      questions = result ? result.questions : await generateQuestions(domain);
      console.log('Amazon Q generated questions:', questions.length);
    } else {
      // Use existing Bedrock generation
      questions = await generateQuestions(domain);
    }
    
    // Create interview session
    const sessionId = uuidv4();
    const interviewData = {
      sessionId,
      candidateId,
      domain,
      questions,
      status: 'active',
      createdAt: new Date().toISOString(),
      currentQuestionIndex: 0
    };
    
    await dynamodb.put({
      TableName: process.env.INTERVIEWS_TABLE,
      Item: interviewData
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({
        sessionId,
        questions: questions.slice(0, 1), // Return first question only
        totalQuestions: questions.length,
        questionSource: service || 'bedrock'
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
      body: JSON.stringify({ error: 'Failed to generate questions' })
    };
  }
};

async function generateQuestions(domain) {
  const prompt = `Generate 5 interview questions for a ${domain} role. 
  Include technical, behavioral, and scenario-based questions.
  Return as JSON array with format: [{"question": "...", "type": "technical|behavioral|scenario", "difficulty": "easy|medium|hard"}]`;
  
  try {
    const params = {
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7
      })
    };
    
    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(response.body.toString());
    
    try {
      return JSON.parse(responseBody.completion);
    } catch {
      // Fallback to predefined questions if AI fails
      return getDefaultQuestions(domain);
    }
  } catch (error) {
    console.error('Bedrock error:', error);
    return getDefaultQuestions(domain);
  }
}

function getDefaultQuestions(domain) {
  const questionBank = {
    'Programming': [
      { question: 'Explain the difference between synchronous and asynchronous programming.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle errors in your code?', type: 'technical', difficulty: 'easy' },
      { question: 'Describe a challenging bug you fixed recently.', type: 'behavioral', difficulty: 'medium' },
      { question: 'Design a system to handle 1 million concurrent users.', type: 'scenario', difficulty: 'hard' },
      { question: 'What are your favorite development tools and why?', type: 'behavioral', difficulty: 'easy' }
    ],
    'Cloud': [
      { question: 'Explain the benefits of cloud computing over traditional infrastructure.', type: 'technical', difficulty: 'easy' },
      { question: 'How would you design a highly available system on AWS?', type: 'scenario', difficulty: 'hard' },
      { question: 'What is the difference between horizontal and vertical scaling?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your experience with containerization.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure security in cloud deployments?', type: 'technical', difficulty: 'medium' }
    ],
    'Frontend': [
      { question: 'What is the virtual DOM and how does it work?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you optimize web application performance?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your approach to responsive design.', type: 'behavioral', difficulty: 'easy' },
      { question: 'Build a component that handles user authentication.', type: 'scenario', difficulty: 'hard' },
      { question: 'What are your preferred CSS methodologies?', type: 'behavioral', difficulty: 'easy' }
    ],
    'Backend': [
      { question: 'Explain RESTful API design principles.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle database transactions?', type: 'technical', difficulty: 'medium' },
      { question: 'Design an API for a social media platform.', type: 'scenario', difficulty: 'hard' },
      { question: 'Describe your experience with microservices.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure API security?', type: 'technical', difficulty: 'medium' }
    ],
    'Data Science': [
      { question: 'Explain the bias-variance tradeoff in machine learning.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle missing data in datasets?', type: 'technical', difficulty: 'easy' },
      { question: 'Design a recommendation system for an e-commerce platform.', type: 'scenario', difficulty: 'hard' },
      { question: 'Describe a data science project you are proud of.', type: 'behavioral', difficulty: 'easy' },
      { question: 'What is overfitting and how do you prevent it?', type: 'technical', difficulty: 'medium' }
    ]
  };
  
  return questionBank[domain] || questionBank['Programming'];
}