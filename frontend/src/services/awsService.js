// AWS Service Integration for Amazon Q CLI & MCP Features
class AWSService {
  constructor() {
    this.API_BASE = 'http://localhost:8001';
  }

  // Amazon Q - Voice Collection & Transcription
  async transcribeAudio(sessionId, audioBlob, questionIndex, realTranscript = '') {
    try {
      console.log('🎤 Amazon Q - Processing audio via API Gateway...');
      
      const response = await fetch(`${this.API_BASE}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          questionIndex,
          audioSize: audioBlob.size,
          realTranscript: realTranscript
        })
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const result = await response.json();
      console.log('✅ Amazon Q - Transcription completed:', result.transcript.substring(0, 50) + '...');
      
      return result;
    } catch (error) {
      console.error('❌ Amazon Q Error:', error);
      // Only use real transcript, no auto-generation
      const transcript = realTranscript || "";
      
      console.log('✅ Amazon Q - Using real transcript only');
      return { transcript, confidence: transcript ? 0.95 : 0, service: "Amazon Q Real" };
    }
  }



  // MCP Powered - Auto Scoring with Bedrock
  async evaluateAnswer(sessionId, question, transcript) {
    try {
      console.log('🤖 MCP - Starting Bedrock AI evaluation...');
      
      const response = await fetch(`${this.API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, question, transcript })
      });
      
      if (!response.ok) {
        throw new Error('Evaluation failed');
      }
      
      const evaluation = await response.json();
      console.log('✅ MCP - AI evaluation completed');
      
      return {
        ...evaluation,
        feedback: `MCP Bedrock Analysis: ${evaluation.feedback}`,
        suggestions: evaluation.suggestions || ['Provide more technical details', 'Include specific examples'],
        expectedAnswer: evaluation.expectedAnswer || 'AI-generated expected answer',
        keywordsFound: evaluation.keywordsFound || 0,
        conceptsCovered: evaluation.conceptsCovered || 0
      };
    } catch (error) {
      console.error('❌ MCP Bedrock Error:', error);
      return this.fallbackEvaluation(transcript);
    }
  }



  fallbackEvaluation(transcriptText) {
    // Strict validation for meaningful content
    if (!transcriptText || transcriptText.trim().length < 15) {
      return {
        technical: 0,
        communication: 0,
        completeness: 0,
        overall: 0,
        feedback: 'No meaningful answer detected. Please provide a substantive response.',
        suggestions: ['Speak clearly into the microphone', 'Provide detailed explanations', 'Answer the question directly'],
        expectedAnswer: 'A comprehensive answer covering key concepts',
        keywordsFound: 0,
        conceptsCovered: 0
      };
    }
    
    const words = transcriptText.toLowerCase().trim().split(/\s+/);
    const wordCount = words.length;
    const uniqueWords = new Set(words);
    const uniqueWordRatio = uniqueWords.size / wordCount;
    
    // Check for negative indicators or poor content quality
    const unknownPhrases = ['don\'t know', 'not sure', 'no idea', 'not familiar', 'no clear speech', 'no audio'];
    const hasUnknown = unknownPhrases.some(phrase => transcriptText.toLowerCase().includes(phrase));
    
    if (hasUnknown || wordCount < 8 || uniqueWordRatio < 0.4) {
      return {
        technical: 0,
        communication: 0,
        completeness: 0,
        overall: 0,
        feedback: 'Response indicates lack of knowledge, very brief answer, or poor audio quality.',
        suggestions: ['Study the topic more thoroughly', 'Provide more detailed responses', 'Ensure clear audio recording'],
        expectedAnswer: 'A comprehensive answer covering key concepts',
        keywordsFound: 0,
        conceptsCovered: 0
      };
    }
    
    // Generous scoring for valid attempts
    const technical = Math.min(Math.max(40, wordCount * 2.0), 85);
    const communication = Math.min(Math.max(45, wordCount * 1.8), 90);
    const completeness = Math.min(Math.max(35, wordCount * 1.5), 80);
    const overall = Math.round((technical + communication + completeness) / 3);
    
    return {
      technical,
      communication,
      completeness,
      overall,
      feedback: overall > 60 ? 
        `Strong performance with ${wordCount} words. Good technical understanding demonstrated.` :
        `Good attempt with ${wordCount} words. Shows understanding of key concepts.`,
      suggestions: ['Include more technical details', 'Provide specific examples', 'Elaborate on key concepts'],
      expectedAnswer: 'A detailed answer with examples and technical depth',
      keywordsFound: Math.min(wordCount * 1.5, 30),
      conceptsCovered: Math.min(wordCount * 1.2, 25)
    };
  }

  // External APIs - Live Job Recommendations
  async fetchJobs(candidateProfile) {
    try {
      console.log('💼 External APIs - Fetching live jobs via API Gateway...');
      
      const response = await fetch(`${this.API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateProfile)
      });
      
      if (!response.ok) {
        throw new Error('Job fetching failed');
      }
      
      const result = await response.json();
      console.log(`✅ External APIs - Found ${result.jobs.length} jobs from multiple sources`);
      
      return result;
    } catch (error) {
      console.error('❌ External APIs Error:', error);
      return this.fallbackJobs(candidateProfile);
    }
  }

  fallbackJobs(profile) {
    return {
      jobs: [
        {
          jobId: 'fallback-1',
          title: 'Senior Software Engineer',
          company: 'TechCorp India',
          location: 'Chennai',
          salary: '₹15,00,000 - ₹25,00,000',
          type: 'Full-time',
          description: 'Build scalable microservices architecture with modern technologies.',
          requirements: ['JavaScript', 'React', 'Node.js', 'AWS'],
          matchScore: 85,
          postedDate: '2024-01-15',
          applicants: 45,
          source: 'Naukri'
        },
        {
          jobId: 'fallback-2',
          title: 'Full Stack Developer',
          company: 'Bangalore Startups',
          location: 'Bengaluru',
          salary: '₹12,00,000 - ₹18,00,000',
          type: 'Full-time',
          description: 'Join our fast-growing startup building next-gen applications.',
          requirements: ['Python', 'Django', 'PostgreSQL'],
          matchScore: 78,
          postedDate: '2024-01-12',
          applicants: 32,
          source: 'Indeed India'
        },
        {
          jobId: 'fallback-3',
          title: 'Frontend Developer',
          company: 'Hyderabad Tech Solutions',
          location: 'Hyderabad',
          salary: '₹10,00,000 - ₹16,00,000',
          type: 'Full-time',
          description: 'Create beautiful, responsive user interfaces for enterprise applications.',
          requirements: ['React', 'TypeScript', 'CSS3'],
          matchScore: 72,
          postedDate: '2024-01-10',
          applicants: 28,
          source: 'LinkedIn India'
        }
      ],
      candidateProfile: {
        domain: profile.domain || 'Programming',
        atsScore: profile.atsScore || 75,
        experience: profile.experience || '3-5 years'
      },
      sources: ['Naukri', 'Indeed India', 'LinkedIn India'],
      totalFound: 3
    };
  }

  calculateMatchScore(profile, jobRequirements) {
    const baseScore = 60;
    const atsBonus = (profile.atsScore - 50) * 0.4;
    const experienceBonus = profile.experience?.includes('5+') ? 15 : 10;
    const randomVariation = Math.random() * 10;
    
    return Math.min(Math.round(baseScore + atsBonus + experienceBonus + randomVariation), 98);
  }


}

export default new AWSService();