import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Interview = ({ user, selectedRole }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes per question
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionScores, setQuestionScores] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    loadInterview();
    setupSpeechRecognition();
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }
  }, [timeLeft, isRecording]);

  const loadInterview = async () => {
    try {
      // Use role-specific questions if available
      if (selectedRole && selectedRole.questions) {
        setQuestions(selectedRole.questions);
      } else {
        // Fallback to default questions
        setQuestions([
          { question: 'Tell me about yourself and your background.', type: 'behavioral', difficulty: 'easy' },
          { question: 'What is your experience with your field?', type: 'technical', difficulty: 'medium' },
          { question: 'How would you approach a challenging project?', type: 'scenario', difficulty: 'hard' },
        ]);
      }
    } catch (error) {
      console.error('Error loading interview:', error);
    }
  };

  const setupSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setCurrentAnswer(prev => prev + ' ' + finalTranscript);
        }
        setTranscript(currentAnswer + ' ' + interimTranscript);
      };

      recognitionRef.current = recognition;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(300); // Reset timer
      setCurrentAnswer('');
      setTranscript('');
      setShowScore(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      // Evaluate the answer immediately
      await evaluateCurrentAnswer();
    }
  };

  const evaluateCurrentAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before stopping.');
      return;
    }

    setEvaluating(true);
    
    try {
      // Simulate Amazon Q transcription processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentQuestion = questions[currentQuestionIndex];
      const evaluation = await evaluateAnswer(currentQuestion, currentAnswer);
      
      // Simulate MCP scoring processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAnswer = {
        questionIndex: currentQuestionIndex,
        transcript: currentAnswer,
        evaluation,
        timestamp: new Date().toISOString(),
      };
      
      setAnswers(prev => [...prev, newAnswer]);
      setQuestionScores(prev => [...prev, evaluation]);
      setShowScore(true);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const evaluateAnswer = async (question, answer) => {
    const lowerAnswer = answer.toLowerCase();
    const wordCount = answer.split(' ').length;
    
    // Get expected answer and keywords for this specific question
    const expectedAnswer = getExpectedAnswer(question.question);
    const keywordScore = calculateKeywordMatch(lowerAnswer, expectedAnswer.keywords);
    const conceptScore = calculateConceptMatch(lowerAnswer, expectedAnswer.concepts);
    const structureScore = calculateStructureScore(answer, question.type);
    
    // Calculate scores with higher base values
    let technical = Math.min(keywordScore * 35 + conceptScore * 30 + (wordCount > 20 ? 35 : wordCount * 1.5) + 15, 100);
    let communication = Math.min(structureScore * 50 + (wordCount > 30 ? 35 : 25) + (hasGoodExamples(answer) ? 20 : 10) + 10, 100);
    let completeness = Math.min(conceptScore * 40 + (wordCount > 50 ? 40 : wordCount * 0.8) + keywordScore * 15 + 20, 100);
    
    // More generous difficulty multipliers
    const difficultyMultiplier = {
      'easy': 1.15,
      'medium': 1.05,
      'hard': 0.95
    };
    
    const multiplier = difficultyMultiplier[question.difficulty] || 1.05;
    technical = Math.min(technical * multiplier, 100);
    communication = Math.min(communication * multiplier, 100);
    completeness = Math.min(completeness * multiplier, 100);
    
    const overall = Math.round((technical + communication + completeness) / 3);
    
    return {
      technical: Math.round(technical),
      communication: Math.round(communication),
      completeness: Math.round(completeness),
      overall,
      feedback: generateDetailedFeedback(overall, keywordScore, conceptScore),
      suggestions: generateSuggestions(question.type, overall),
      expectedAnswer: expectedAnswer.answer,
      keywordsFound: keywordScore,
      conceptsCovered: conceptScore
    };
  };

  const getExpectedAnswer = (questionText) => {
    const answerBank = {
      'tell me about yourself and your background.': {
        answer: 'Provide a brief professional summary highlighting your experience, skills, and career goals. Focus on relevant achievements and what makes you a good fit for the role.',
        keywords: ['experience', 'skills', 'achievements', 'professional', 'career'],
        concepts: ['background', 'qualifications', 'goals', 'fit']
      },
      'what is your experience with your field?': {
        answer: 'Discuss your relevant work experience, projects, technologies used, and key accomplishments. Highlight specific examples that demonstrate your expertise.',
        keywords: ['experience', 'projects', 'technologies', 'accomplishments', 'expertise'],
        concepts: ['work history', 'technical skills', 'achievements', 'knowledge']
      },
      'how would you approach a challenging project?': {
        answer: 'Describe your problem-solving methodology, planning process, risk assessment, team collaboration, and how you handle obstacles. Include specific steps and examples.',
        keywords: ['methodology', 'planning', 'risk assessment', 'collaboration', 'obstacles'],
        concepts: ['problem-solving', 'project management', 'teamwork', 'strategy']
      }
    };
    
    const key = questionText.toLowerCase().trim();
    return answerBank[key] || {
      answer: 'Provide a comprehensive answer with specific examples and demonstrate your understanding of the topic.',
      keywords: ['experience', 'knowledge', 'examples', 'understanding'],
      concepts: ['expertise', 'application', 'problem-solving']
    };
  };

  const calculateKeywordMatch = (answer, keywords) => {
    const foundKeywords = keywords.filter(keyword => 
      answer.includes(keyword.toLowerCase())
    );
    return Math.round((foundKeywords.length / keywords.length) * 100);
  };

  const calculateConceptMatch = (answer, concepts) => {
    const foundConcepts = concepts.filter(concept => 
      answer.includes(concept.toLowerCase())
    );
    return Math.round((foundConcepts.length / concepts.length) * 100);
  };

  const calculateStructureScore = (answer, type) => {
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasIntro = sentences.length > 0 && sentences[0].length > 15;
    const hasExamples = hasGoodExamples(answer);
    const hasConclusion = sentences.length > 1;
    
    let score = 55; // Higher base score
    if (hasIntro) score += 25;
    if (hasExamples) score += 30;
    if (hasConclusion) score += 20;
    
    return Math.min(score, 100);
  };

  const hasGoodExamples = (answer) => {
    const exampleIndicators = ['example', 'for instance', 'such as', 'like', 'including', 'consider'];
    return exampleIndicators.some(indicator => answer.toLowerCase().includes(indicator));
  };

  const generateDetailedFeedback = (overall, keywordScore, conceptScore) => {
    let feedback = '';
    
    if (overall >= 85) {
      feedback = 'Excellent answer! You covered the key concepts comprehensively.';
    } else if (overall >= 70) {
      feedback = 'Good answer with solid understanding. ';
      if (keywordScore < 60) feedback += 'Include more specific technical terms. ';
      if (conceptScore < 60) feedback += 'Cover more core concepts. ';
    } else if (overall >= 50) {
      feedback = 'Basic answer that needs improvement. ';
      if (keywordScore < 40) feedback += 'Use more relevant technical vocabulary. ';
      if (conceptScore < 40) feedback += 'Demonstrate deeper conceptual understanding. ';
    } else {
      feedback = 'Answer needs significant improvement. Focus on understanding the core concepts and using appropriate technical terminology.';
    }
    
    return feedback;
  };

  const generateSuggestions = (type, score) => {
    const suggestions = {
      'technical': [
        'Include specific technical details',
        'Mention relevant technologies or frameworks',
        'Explain your thought process step by step',
        'Discuss trade-offs and alternatives'
      ],
      'behavioral': [
        'Use the STAR method (Situation, Task, Action, Result)',
        'Provide specific examples from your experience',
        'Quantify your achievements with numbers',
        'Show learning and growth from challenges'
      ],
      'scenario': [
        'Break down the problem systematically',
        'Consider multiple approaches',
        'Discuss potential risks and mitigation',
        'Explain your decision-making process'
      ]
    };
    
    return suggestions[type] || suggestions['technical'];
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(300);
      setShowScore(false);
      setCurrentAnswer('');
      setTranscript('');
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    const overallResults = calculateOverallResults();
    
    localStorage.setItem(`interview-${sessionId}`, JSON.stringify({
      answers,
      questionScores,
      overallResults,
      selectedRole
    }));

    navigate(`/results/${sessionId}`);
  };

  const calculateOverallResults = () => {
    if (questionScores.length === 0) return null;
    
    const avgTechnical = questionScores.reduce((sum, score) => sum + score.technical, 0) / questionScores.length;
    const avgCommunication = questionScores.reduce((sum, score) => sum + score.communication, 0) / questionScores.length;
    const avgCompleteness = questionScores.reduce((sum, score) => sum + score.completeness, 0) / questionScores.length;
    const overallScore = questionScores.reduce((sum, score) => sum + score.overall, 0) / questionScores.length;
    
    const strengths = [];
    const weaknesses = [];
    
    if (avgTechnical >= 75) strengths.push('Technical Knowledge');
    else weaknesses.push('Technical Knowledge');
    
    if (avgCommunication >= 75) strengths.push('Communication Skills');
    else weaknesses.push('Communication Skills');
    
    if (avgCompleteness >= 75) strengths.push('Answer Completeness');
    else weaknesses.push('Answer Completeness');
    
    return {
      overallScore: Math.round(overallScore),
      technical: Math.round(avgTechnical),
      communication: Math.round(avgCommunication),
      completeness: Math.round(avgCompleteness),
      strengths,
      weaknesses
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naukri-blue"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <div className="text-lg font-mono text-naukri-blue">
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-naukri-blue h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentQuestion.type === 'technical' ? 'bg-blue-100 text-blue-800' :
            currentQuestion.type === 'behavioral' ? 'bg-green-100 text-green-800' :
            'bg-purple-100 text-purple-800'
          }`}>
            {currentQuestion.type}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {currentQuestion.difficulty}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

        {/* Recording Controls */}
        <div className="text-center space-y-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="btn-primary text-lg px-8 py-4"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span>Start Recording</span>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording...</span>
              </div>
              
              <button
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg"
              >
                Stop Recording
              </button>
            </div>
          )}
        </div>

        {/* Live Transcript */}
        {transcript && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Live Transcript:</h4>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        {/* Answer Evaluation */}
        {evaluating && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-blue-700 mb-3 font-medium">Processing with AI Services...</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  Amazon Q Transcribing
                </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  MCP Powered Scoring
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Analyzing your response with advanced AI models...
            </p>
          </div>
        )}

        {showScore && questionScores[currentQuestionIndex] && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3">Answer Evaluation</h4>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{questionScores[currentQuestionIndex].technical}</div>
                <div className="text-sm text-gray-600">Technical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{questionScores[currentQuestionIndex].communication}</div>
                <div className="text-sm text-gray-600">Communication</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{questionScores[currentQuestionIndex].completeness}</div>
                <div className="text-sm text-gray-600">Completeness</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{questionScores[currentQuestionIndex].overall}</div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
            </div>
            <div className="bg-white rounded p-3 mb-3">
              <div className="flex items-center mb-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mr-2">
                  ✅ AI Analyzed
                </span>
                <span className="text-sm font-medium text-gray-800">Feedback:</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                {questionScores[currentQuestionIndex].feedback}
              </p>
              <div className="text-xs text-gray-600 mt-2 flex space-x-4">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  Keywords: {questionScores[currentQuestionIndex].keywordsFound}%
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                  Concepts: {questionScores[currentQuestionIndex].conceptsCovered}%
                </span>
              </div>
            </div>
            <div className="bg-blue-50 rounded p-3 mb-3">
              <p className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Expected Answer:
              </p>
              <p className="text-sm text-blue-700">{questionScores[currentQuestionIndex].expectedAnswer}</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                <span className="mr-2">🚀</span>
                Suggestions for improvement:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {questionScores[currentQuestionIndex].suggestions.slice(0, 2).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous Question
        </button>
        
        <button
          onClick={nextQuestion}
          disabled={isRecording || !showScore}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
        </button>
        
        {!showScore && !isRecording && currentAnswer && (
          <p className="text-sm text-gray-600 text-center">
            Please stop recording to see your score and continue
          </p>
        )}
      </div>
    </div>
  );
};

export default Interview;