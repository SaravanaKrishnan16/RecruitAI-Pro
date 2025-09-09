const AWS = require('aws-sdk');

const bedrock = new AWS.BedrockRuntime();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const { sessionId } = JSON.parse(event.body);
    
    // Get interview session
    const sessionResult = await dynamodb.get({
      TableName: process.env.INTERVIEWS_TABLE,
      Key: { sessionId }
    }).promise();
    
    if (!sessionResult.Item) {
      throw new Error('Session not found');
    }
    
    const session = sessionResult.Item;
    const evaluations = [];
    
    // Evaluate each answer
    for (let i = 0; i < session.questions.length; i++) {
      const question = session.questions[i];
      const answer = session.answers && session.answers[i];
      
      if (answer && answer.transcript) {
        const evaluation = await evaluateAnswer(question, answer.transcript);
        evaluations.push(evaluation);
      }
    }
    
    // Calculate overall score
    const overallScore = calculateOverallScore(evaluations);
    const feedback = generateFeedback(evaluations, overallScore);
    
    // Update session with evaluation
    await dynamodb.update({
      TableName: process.env.INTERVIEWS_TABLE,
      Key: { sessionId },
      UpdateExpression: 'SET evaluations = :eval, overallScore = :score, feedback = :feedback, #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':eval': evaluations,
        ':score': overallScore,
        ':feedback': feedback,
        ':status': 'completed'
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: JSON.stringify({
        overallScore,
        evaluations,
        feedback
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
      body: JSON.stringify({ error: 'Failed to evaluate answers' })
    };
  }
};

async function evaluateAnswer(question, answer) {
  const mcpScore = evaluateWithMCP(question.question, answer);
  
  // More generous scoring - 0-10 becomes 40-95 range
  const baseScore = 40 + (mcpScore.score * 5.5); // 40-95 range
  const bonusScore = mcpScore.score > 6 ? 5 : 0; // Bonus for good answers
  const finalScore = Math.min(95, baseScore + bonusScore);
  
  return {
    technical: Math.round(finalScore),
    communication: Math.round(Math.min(95, finalScore + 3)),
    completeness: Math.round(Math.min(95, finalScore - 2)),
    overall: Math.round(finalScore),
    feedback: mcpScore.feedback
  };
}

function evaluateWithMCP(questionText, transcript) {
  // Check for auto-generated or invalid responses
  if (!transcript || transcript.trim().length < 5) {
    return { score: 0, feedback: "No valid speech detected - please record your actual answer." };
  }
  
  const cleanTranscript = transcript.toLowerCase().trim();
  const words = cleanTranscript.split(/\s+/);
  
  // More generous scoring for real attempts
  const relevance = scoreRelevance(questionText, transcript);
  const depth = scoreDepth(transcript);
  const clarity = scoreClarity(transcript);
  const accuracy = scoreAccuracy(questionText, transcript);
  
  const totalScore = Math.min(10, relevance + depth + clarity + accuracy + 3); // +3 bonus for real attempt
  
  let feedback;
  if (totalScore <= 4) feedback = "Good attempt - shows understanding of the topic.";
  else if (totalScore <= 7) feedback = "Strong answer with good technical knowledge and clear communication.";
  else if (totalScore <= 9) feedback = "Excellent response demonstrating deep understanding and expertise.";
  else feedback = "Outstanding comprehensive answer with exceptional technical depth.";
  
  return { score: totalScore, feedback };
}

function scoreRelevance(question, answer) {
  const questionKeywords = question.toLowerCase().match(/\b\w{3,}\b/g) || [];
  const answerText = answer.toLowerCase();
  const matches = questionKeywords.filter(word => answerText.includes(word));
  
  let score = 2; // Higher base score
  if (matches.length >= 1) score += 1;
  if (matches.length >= 3) score += 1;
  return Math.min(score, 4);
}

function scoreDepth(answer) {
  const words = answer.split(/\s+/).length;
  const hasExamples = /example|instance|such as|like|including|for example|experience|work|project/.test(answer.toLowerCase());
  const hasTechnical = /implement|design|develop|create|build|use|technology|system|process/.test(answer.toLowerCase());
  
  let score = 2; // Higher base score
  if (words >= 15) score += 1;
  if (words >= 30) score += 1;
  if (hasExamples || hasTechnical) score += 1;
  return Math.min(score, 5);
}

function scoreClarity(answer) {
  const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = answer.split(/\s+/).length;
  
  let score = 1; // Base score for speaking
  if (words >= 8) score += 1;
  if (sentences.length >= 2) score += 1;
  return Math.min(score, 3);
}

function scoreAccuracy(question, answer) {
  const nonsensePatterns = /asdf|qwerty|123456|random text|test test|hello hello/i;
  if (nonsensePatterns.test(answer)) return 0;
  
  const words = answer.split(/\s+/).length;
  let score = 1; // Base score
  if (words >= 10) score += 1;
  if (words >= 20) score += 1;
  return Math.min(score, 3);
}

function getDefaultEvaluation(question, answer) {
  const mcpResult = evaluateWithMCP(question.question, answer);
  const baseScore = 40 + (mcpResult.score * 5.5);
  const bonusScore = mcpResult.score > 6 ? 5 : 0;
  const finalScore = Math.min(95, baseScore + bonusScore);
  
  return {
    technical: Math.round(finalScore),
    communication: Math.round(Math.min(95, finalScore + 3)),
    completeness: Math.round(Math.min(95, finalScore - 2)),
    overall: Math.round(finalScore),
    feedback: mcpResult.feedback
  };
}

function calculateOverallScore(evaluations) {
  if (evaluations.length === 0) return 0;
  
  const totalScore = evaluations.reduce((sum, eval) => sum + eval.overall, 0);
  return Math.round(totalScore / evaluations.length);
}

function generateFeedback(evaluations, overallScore) {
  const strengths = [];
  const improvements = [];
  
  const avgTechnical = evaluations.reduce((sum, eval) => sum + eval.technical, 0) / evaluations.length;
  const avgCommunication = evaluations.reduce((sum, eval) => sum + eval.communication, 0) / evaluations.length;
  const avgCompleteness = evaluations.reduce((sum, eval) => sum + eval.completeness, 0) / evaluations.length;
  
  if (avgTechnical > 75) strengths.push('Strong technical knowledge');
  else improvements.push('Improve technical depth in answers');
  
  if (avgCommunication > 75) strengths.push('Clear communication skills');
  else improvements.push('Work on communication clarity');
  
  if (avgCompleteness > 75) strengths.push('Comprehensive answers');
  else improvements.push('Provide more complete responses');
  
  return {
    overallScore,
    strengths,
    improvements,
    summary: `Overall performance: ${overallScore > 80 ? 'Excellent' : overallScore > 60 ? 'Good' : 'Needs Improvement'}`
  };
}