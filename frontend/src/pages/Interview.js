import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

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
      // Get stored data
      const candidateProfile = JSON.parse(localStorage.getItem('candidateProfile') || '{}');
      const resumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
      const storedRole = JSON.parse(localStorage.getItem('selectedRole') || 'null');
      const currentRole = selectedRole || storedRole;
      
      console.log('🤖 Loading Amazon Q questions for role:', currentRole?.id || 'No role selected');
      console.log('📊 Selected Role Object:', currentRole);
      console.log('📊 Candidate Profile:', candidateProfile);
      console.log('📊 Resume Data:', resumeData);
      
      const response = await fetch('http://localhost:8003/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: currentRole?.id || 'frontend-developer',
          candidateProfile,
          resumeData,
          service: 'amazon-q',
          questionCount: 10
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Amazon Q Questions Response:', data);
        console.log('📊 Questions Source:', data.source);
        console.log('📊 Questions Count:', data.questions?.length);
        setQuestions(data.questions || currentRole?.questions?.slice(0, 10) || []);
      } else {
        // Fallback to role questions (10 questions)
        setQuestions(currentRole?.questions?.slice(0, 10) || [
          { question: 'Tell me about yourself and your background.', type: 'behavioral', difficulty: 'easy' },
          { question: 'What is your experience with your field?', type: 'technical', difficulty: 'medium' },
          { question: 'How would you approach a challenging project?', type: 'scenario', difficulty: 'hard' },
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading Amazon Q questions:', error);
      console.log('🔄 Falling back to role-specific questions');
      const storedRole = JSON.parse(localStorage.getItem('selectedRole') || 'null');
      const currentRole = selectedRole || storedRole;
      // Use role-specific questions as fallback (10 questions)
      setQuestions(currentRole?.questions?.slice(0, 10) || [
        { question: 'Tell me about yourself and your background.', type: 'behavioral', difficulty: 'easy' },
        { question: 'What is your experience with your field?', type: 'technical', difficulty: 'medium' },
        { question: 'How would you approach a challenging project?', type: 'scenario', difficulty: 'hard' },
      ]);
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
      const currentQuestion = questions[currentQuestionIndex];
      const evaluation = await evaluateAnswer(currentQuestion, currentAnswer);
      
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
    
    // Calculate scores based on actual content analysis
    let technical = Math.min(keywordScore * 40 + conceptScore * 35 + (wordCount > 30 ? 25 : wordCount), 100);
    let communication = Math.min(structureScore * 60 + (wordCount > 50 ? 25 : 15) + (hasGoodExamples(answer) ? 15 : 0), 100);
    let completeness = Math.min(conceptScore * 50 + (wordCount > 80 ? 30 : wordCount/3) + keywordScore * 20, 100);
    
    // Adjust based on difficulty
    const difficultyMultiplier = {
      'easy': 1.1,
      'medium': 1.0,
      'hard': 0.85
    };
    
    const multiplier = difficultyMultiplier[question.difficulty] || 1.0;
    technical = Math.min(technical * multiplier, 100);
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
      // Frontend Developer Questions
      'explain the difference between let, const, and var in javascript.': {
        answer: 'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared. let and const have temporal dead zone, var gets hoisted and initialized with undefined.',
        keywords: ['block-scoped', 'function-scoped', 'reassigned', 'hoisted', 'temporal dead zone'],
        concepts: ['scope', 'hoisting', 'reassignment', 'declaration']
      },
      'how do you optimize react component performance?': {
        answer: 'Use React.memo for functional components, useMemo and useCallback hooks to memoize expensive calculations and functions, implement proper key props in lists, avoid creating objects in render, use lazy loading with React.lazy, and consider code splitting.',
        keywords: ['react.memo', 'usememo', 'usecallback', 'memoization', 'lazy loading', 'code splitting'],
        concepts: ['memoization', 'performance', 'rendering', 'optimization']
      },
      'what is the css box model and how does it work?': {
        answer: 'The CSS box model consists of content, padding, border, and margin. Content is the actual element content, padding is space inside the border, border surrounds the padding, and margin is space outside the border. Box-sizing property controls how width/height are calculated.',
        keywords: ['content', 'padding', 'border', 'margin', 'box-sizing'],
        concepts: ['layout', 'spacing', 'dimensions', 'box model']
      },
      'describe your experience with responsive web design.': {
        answer: 'Responsive design uses flexible grids, media queries, and fluid images to create layouts that adapt to different screen sizes. Key techniques include mobile-first approach, breakpoints, flexible typography, and testing across devices.',
        keywords: ['media queries', 'flexible grids', 'mobile-first', 'breakpoints', 'fluid images'],
        concepts: ['responsive design', 'adaptability', 'cross-device', 'user experience']
      },
      'how do you handle cross-browser compatibility issues?': {
        answer: 'Use CSS resets/normalize, feature detection with tools like Modernizr, progressive enhancement, vendor prefixes, polyfills for missing features, and thorough testing across browsers. Follow web standards and use established frameworks.',
        keywords: ['css reset', 'modernizr', 'progressive enhancement', 'vendor prefixes', 'polyfills'],
        concepts: ['compatibility', 'web standards', 'feature detection', 'testing']
      },
      'what are react hooks and why are they useful?': {
        answer: 'React hooks are functions that let you use state and lifecycle features in functional components. They promote code reuse, simplify component logic, eliminate class component complexity, and enable custom hooks for shared stateful logic.',
        keywords: ['usestate', 'useeffect', 'functional components', 'custom hooks', 'stateful logic'],
        concepts: ['hooks', 'state management', 'lifecycle', 'reusability']
      },
      'how do you ensure web accessibility in your applications?': {
        answer: 'Follow WCAG guidelines, use semantic HTML, provide alt text for images, ensure keyboard navigation, maintain proper color contrast, use ARIA attributes, test with screen readers, and implement focus management.',
        keywords: ['wcag', 'semantic html', 'alt text', 'keyboard navigation', 'aria attributes', 'screen readers'],
        concepts: ['accessibility', 'inclusive design', 'usability', 'compliance']
      },
      'describe a challenging frontend project you worked on.': {
        answer: 'Discuss a specific project highlighting technical challenges, problem-solving approach, technologies used, team collaboration, obstacles overcome, and lessons learned. Focus on your contributions and the impact achieved.',
        keywords: ['technical challenges', 'problem-solving', 'collaboration', 'impact', 'lessons learned'],
        concepts: ['project management', 'technical skills', 'teamwork', 'growth']
      },
      'how do you manage state in a react application?': {
        answer: 'Use local state with useState for component-specific data, Context API for app-wide state, Redux or Zustand for complex state management, and consider server state libraries like React Query for API data.',
        keywords: ['usestate', 'context api', 'redux', 'zustand', 'react query', 'server state'],
        concepts: ['state management', 'data flow', 'architecture', 'performance']
      },
      'what tools do you use for debugging frontend issues?': {
        answer: 'Browser DevTools for DOM inspection and debugging, React DevTools for component analysis, console logging, network tab for API issues, Lighthouse for performance auditing, and error tracking tools like Sentry.',
        keywords: ['devtools', 'react devtools', 'console logging', 'lighthouse', 'sentry'],
        concepts: ['debugging', 'performance analysis', 'error tracking', 'optimization']
      },

      // Backend Developer Questions
      'explain the difference between sql and nosql databases.': {
        answer: 'SQL databases are relational with structured schemas, ACID compliance, and use SQL queries. NoSQL databases are non-relational, schema-flexible, horizontally scalable, and include document, key-value, column-family, and graph types.',
        keywords: ['relational', 'schema', 'acid', 'horizontal scaling', 'document', 'key-value'],
        concepts: ['database types', 'scalability', 'consistency', 'flexibility']
      },
      'how do you design a restful api?': {
        answer: 'Use HTTP methods appropriately (GET, POST, PUT, DELETE), implement proper status codes, design intuitive URL structures with nouns, use JSON for data exchange, implement authentication, add rate limiting, version your API, and provide documentation.',
        keywords: ['http methods', 'status codes', 'json', 'authentication', 'rate limiting', 'versioning'],
        concepts: ['rest principles', 'api design', 'http', 'documentation']
      },
      'what is database indexing and why is it important?': {
        answer: 'Database indexing creates data structures that improve query performance by providing faster data retrieval paths. Indexes speed up SELECT operations but slow down INSERT/UPDATE/DELETE. Choose indexes based on query patterns and balance performance vs storage.',
        keywords: ['data structures', 'query performance', 'select operations', 'query patterns'],
        concepts: ['performance optimization', 'database design', 'trade-offs', 'efficiency']
      },
      'how do you handle authentication and authorization?': {
        answer: 'Use secure authentication methods like JWT tokens, OAuth, or session-based auth. Implement role-based access control (RBAC), validate tokens on each request, use HTTPS, hash passwords with bcrypt, and implement proper session management.',
        keywords: ['jwt tokens', 'oauth', 'rbac', 'https', 'bcrypt', 'session management'],
        concepts: ['security', 'access control', 'authentication', 'authorization']
      },
      'describe your experience with microservices architecture.': {
        answer: 'Microservices break applications into small, independent services that communicate via APIs. Benefits include scalability, technology diversity, and fault isolation. Challenges include complexity, data consistency, and network latency.',
        keywords: ['independent services', 'apis', 'scalability', 'fault isolation', 'data consistency'],
        concepts: ['architecture', 'distributed systems', 'scalability', 'complexity']
      },
      'how do you optimize database queries for performance?': {
        answer: 'Use proper indexing, analyze query execution plans, avoid N+1 queries, implement query caching, optimize JOIN operations, use database-specific features, and monitor query performance with profiling tools.',
        keywords: ['indexing', 'execution plans', 'n+1 queries', 'query caching', 'join operations'],
        concepts: ['performance optimization', 'database tuning', 'monitoring', 'efficiency']
      },
      'what are the principles of good api design?': {
        answer: 'Follow REST principles, use consistent naming conventions, implement proper error handling, provide clear documentation, version your API, use appropriate HTTP status codes, implement rate limiting, and ensure security.',
        keywords: ['rest principles', 'naming conventions', 'error handling', 'documentation', 'rate limiting'],
        concepts: ['api design', 'consistency', 'usability', 'maintainability']
      },
      'how do you handle error handling in backend applications?': {
        answer: 'Implement try-catch blocks, use custom error classes, log errors appropriately, return meaningful error messages, implement global error handlers, use proper HTTP status codes, and monitor errors in production.',
        keywords: ['try-catch', 'custom error classes', 'error logging', 'global error handlers', 'status codes'],
        concepts: ['error handling', 'debugging', 'monitoring', 'user experience']
      },
      'describe a complex backend system you built.': {
        answer: 'Discuss architecture decisions, scalability challenges, technology choices, database design, API structure, performance optimizations, security implementations, and lessons learned from the project.',
        keywords: ['architecture', 'scalability', 'database design', 'performance', 'security'],
        concepts: ['system design', 'technical leadership', 'problem-solving', 'best practices']
      },
      'how do you ensure data security in your applications?': {
        answer: 'Implement encryption for data at rest and in transit, use parameterized queries to prevent SQL injection, validate and sanitize inputs, implement proper authentication and authorization, use HTTPS, and follow security best practices.',
        keywords: ['encryption', 'sql injection', 'input validation', 'https', 'security best practices'],
        concepts: ['data security', 'vulnerability prevention', 'compliance', 'risk management']
      },

      // Data Scientist Questions
      'explain the difference between supervised and unsupervised learning.': {
        answer: 'Supervised learning uses labeled training data to learn mapping from inputs to outputs, includes classification and regression. Unsupervised learning finds patterns in unlabeled data, includes clustering, dimensionality reduction, and association rules.',
        keywords: ['labeled data', 'classification', 'regression', 'clustering', 'dimensionality reduction'],
        concepts: ['machine learning', 'training data', 'patterns', 'algorithms']
      },
      'how do you handle missing data in datasets?': {
        answer: 'Strategies include deletion (listwise/pairwise), imputation (mean/median/mode), advanced imputation (KNN, regression), using algorithms that handle missing values, and creating missing value indicators. Choice depends on data type and missingness pattern.',
        keywords: ['deletion', 'imputation', 'knn imputation', 'missing value indicators', 'missingness pattern'],
        concepts: ['data preprocessing', 'data quality', 'statistical methods', 'bias prevention']
      },
      'what is overfitting and how do you prevent it?': {
        answer: 'Overfitting occurs when a model learns training data too well, performing poorly on new data. Prevention methods include cross-validation, regularization (L1/L2), early stopping, dropout, data augmentation, and using simpler models.',
        keywords: ['cross-validation', 'regularization', 'early stopping', 'dropout', 'data augmentation'],
        concepts: ['model generalization', 'bias-variance tradeoff', 'validation', 'model complexity']
      },
      'describe your approach to feature engineering.': {
        answer: 'Feature engineering involves creating, selecting, and transforming features to improve model performance. Techniques include scaling, encoding categorical variables, creating interaction terms, polynomial features, and domain-specific transformations.',
        keywords: ['feature scaling', 'categorical encoding', 'interaction terms', 'polynomial features', 'transformations'],
        concepts: ['feature selection', 'data transformation', 'domain knowledge', 'model improvement']
      },
      'how do you evaluate the performance of a machine learning model?': {
        answer: 'Use appropriate metrics (accuracy, precision, recall, F1-score, AUC-ROC for classification; MSE, MAE, R² for regression), cross-validation, confusion matrices, learning curves, and business-relevant metrics.',
        keywords: ['accuracy', 'precision', 'recall', 'f1-score', 'auc-roc', 'cross-validation'],
        concepts: ['model evaluation', 'performance metrics', 'validation', 'business impact']
      },
      'explain the bias-variance tradeoff.': {
        answer: 'Bias is error from oversimplified assumptions, variance is error from sensitivity to small fluctuations. High bias leads to underfitting, high variance to overfitting. The goal is finding the optimal balance to minimize total error.',
        keywords: ['bias', 'variance', 'underfitting', 'overfitting', 'total error'],
        concepts: ['model complexity', 'generalization', 'error decomposition', 'optimization']
      },
      'describe a data science project you are proud of.': {
        answer: 'Discuss the business problem, data collection and cleaning process, exploratory analysis, model selection and validation, results achieved, and business impact. Highlight challenges overcome and lessons learned.',
        keywords: ['business problem', 'data cleaning', 'exploratory analysis', 'model validation', 'business impact'],
        concepts: ['project lifecycle', 'problem-solving', 'communication', 'value creation']
      },
      'how do you communicate technical findings to non-technical stakeholders?': {
        answer: 'Use clear visualizations, avoid jargon, focus on business impact, tell a story with data, provide actionable insights, use analogies, and tailor the message to the audience. Create executive summaries and interactive dashboards.',
        keywords: ['visualizations', 'business impact', 'actionable insights', 'executive summaries', 'dashboards'],
        concepts: ['communication', 'storytelling', 'stakeholder management', 'business alignment']
      },
      'what is your process for data cleaning and preprocessing?': {
        answer: 'Start with data exploration, identify and handle missing values, detect and treat outliers, ensure data consistency, perform feature scaling/normalization, encode categorical variables, and validate data quality throughout the process.',
        keywords: ['data exploration', 'missing values', 'outliers', 'data consistency', 'feature scaling'],
        concepts: ['data quality', 'preprocessing pipeline', 'data validation', 'preparation']
      },
      'how do you choose the right algorithm for a problem?': {
        answer: 'Consider the problem type (classification/regression/clustering), data size and dimensionality, interpretability requirements, performance constraints, available features, and domain knowledge. Start simple and iterate.',
        keywords: ['problem type', 'data size', 'interpretability', 'performance constraints', 'domain knowledge'],
        concepts: ['algorithm selection', 'problem analysis', 'constraints', 'iteration']
      },

      // DevOps Engineer Questions
      'explain the concept of infrastructure as code.': {
        answer: 'Infrastructure as Code (IaC) manages and provisions infrastructure through code rather than manual processes. Tools like Terraform, CloudFormation, and Ansible enable version control, repeatability, consistency, and automation of infrastructure deployment.',
        keywords: ['terraform', 'cloudformation', 'ansible', 'version control', 'automation'],
        concepts: ['infrastructure management', 'automation', 'consistency', 'scalability']
      },
      'how do you implement ci/cd pipelines?': {
        answer: 'Set up automated build, test, and deployment stages using tools like Jenkins, GitLab CI, or GitHub Actions. Include code quality checks, automated testing, security scanning, and deployment to multiple environments with rollback capabilities.',
        keywords: ['jenkins', 'gitlab ci', 'github actions', 'automated testing', 'rollback'],
        concepts: ['continuous integration', 'continuous deployment', 'automation', 'quality assurance']
      },
      'what is containerization and why is it useful?': {
        answer: 'Containerization packages applications with dependencies into lightweight, portable containers. Benefits include consistency across environments, faster deployment, resource efficiency, scalability, isolation, and easier microservices architecture.',
        keywords: ['docker', 'portable', 'dependencies', 'microservices', 'isolation', 'scalability'],
        concepts: ['virtualization', 'deployment', 'portability', 'efficiency']
      },

      // Mobile Developer Questions
      'compare react native and flutter for mobile development.': {
        answer: 'React Native uses JavaScript and native components, good for teams with React experience. Flutter uses Dart and custom widgets, offers better performance and UI consistency. React Native has larger community, Flutter has better development tools.',
        keywords: ['javascript', 'dart', 'native components', 'custom widgets', 'performance'],
        concepts: ['cross-platform development', 'performance', 'developer experience', 'ecosystem']
      },
      'how do you handle different screen sizes in mobile apps?': {
        answer: 'Use responsive design with flexible layouts, implement adaptive UI components, utilize device-specific stylesheets, test on multiple screen densities, use vector graphics, implement proper touch targets, and consider orientation changes.',
        keywords: ['responsive design', 'flexible layouts', 'screen densities', 'vector graphics', 'touch targets'],
        concepts: ['mobile ui', 'adaptability', 'user experience', 'accessibility']
      },

      // UI/UX Designer Questions
      'explain your design process from concept to final product.': {
        answer: 'Start with user research and requirements gathering, create user personas and journey maps, develop wireframes and prototypes, conduct usability testing, iterate based on feedback, create high-fidelity designs, collaborate with developers, and validate final implementation.',
        keywords: ['user research', 'personas', 'wireframes', 'prototypes', 'usability testing', 'iteration'],
        concepts: ['design thinking', 'user-centered design', 'validation', 'collaboration']
      },
      'what is the difference between ui and ux design?': {
        answer: 'UI (User Interface) design focuses on visual elements, layouts, and interactive components. UX (User Experience) design encompasses the entire user journey, including research, information architecture, usability, and overall satisfaction.',
        keywords: ['visual elements', 'interactive components', 'user journey', 'information architecture', 'usability'],
        concepts: ['interface design', 'user experience', 'design disciplines', 'holistic approach']
      },

      // Product Manager Questions
      'how do you prioritize features in a product roadmap?': {
        answer: 'Use frameworks like RICE (Reach, Impact, Confidence, Effort) or MoSCoW, analyze user feedback and data, consider business objectives, evaluate technical feasibility, assess market competition, and balance quick wins with long-term strategic goals.',
        keywords: ['rice framework', 'moscow', 'user feedback', 'business objectives', 'technical feasibility'],
        concepts: ['prioritization', 'strategy', 'stakeholder management', 'data-driven decisions']
      },
      'how do you measure product success and kpis?': {
        answer: 'Define clear success metrics aligned with business goals, track user engagement, retention, conversion rates, customer satisfaction (NPS), revenue impact, and feature adoption. Use analytics tools and establish baseline measurements.',
        keywords: ['success metrics', 'user engagement', 'retention', 'conversion rates', 'nps', 'analytics'],
        concepts: ['product metrics', 'business alignment', 'measurement', 'data analysis']
      },

      // QA Engineer Questions
      'explain the difference between manual and automated testing.': {
        answer: 'Manual testing involves human testers executing test cases, good for exploratory and usability testing. Automated testing uses scripts and tools for repetitive tests, faster execution, and regression testing. Both are complementary.',
        keywords: ['human testers', 'exploratory testing', 'scripts', 'regression testing', 'complementary'],
        concepts: ['testing approaches', 'efficiency', 'test coverage', 'quality assurance']
      },
      'how do you design test cases for a new feature?': {
        answer: 'Analyze requirements, identify test scenarios, create positive and negative test cases, consider edge cases and boundary conditions, define expected results, prioritize based on risk, and ensure traceability to requirements.',
        keywords: ['requirements analysis', 'test scenarios', 'edge cases', 'boundary conditions', 'traceability'],
        concepts: ['test design', 'requirement coverage', 'risk assessment', 'quality planning']
      },

      // Cybersecurity Analyst Questions
      'explain the cia triad in cybersecurity.': {
        answer: 'CIA stands for Confidentiality (protecting data from unauthorized access), Integrity (ensuring data accuracy and preventing unauthorized modification), and Availability (ensuring systems and data are accessible when needed).',
        keywords: ['confidentiality', 'integrity', 'availability', 'unauthorized access', 'data accuracy'],
        concepts: ['security principles', 'data protection', 'system reliability', 'access control']
      },
      'how do you conduct a security risk assessment?': {
        answer: 'Identify assets and threats, assess vulnerabilities, determine likelihood and impact, calculate risk levels, prioritize risks, develop mitigation strategies, document findings, and establish monitoring procedures.',
        keywords: ['assets', 'threats', 'vulnerabilities', 'likelihood', 'impact', 'mitigation'],
        concepts: ['risk management', 'threat analysis', 'vulnerability assessment', 'security planning']
      }
    };
    
    // Clean and normalize the question text
    const key = questionText.toLowerCase().trim();
    let match = answerBank[key];
    
    if (!match) {
      // Try exact match without punctuation
      const cleanKey = key.replace(/[^a-z0-9\s]/g, '');
      const cleanMatch = Object.keys(answerBank).find(answerKey => 
        answerKey.replace(/[^a-z0-9\s]/g, '') === cleanKey
      );
      if (cleanMatch) match = answerBank[cleanMatch];
    }
    
    if (!match) {
      // Try partial matching for similar questions
      const partialMatch = Object.keys(answerBank).find(answerKey => {
        const keyWords = key.split(' ').slice(0, 4).join(' ');
        const answerWords = answerKey.split(' ').slice(0, 4).join(' ');
        return keyWords === answerWords || key.includes(answerWords) || answerKey.includes(keyWords);
      });
      if (partialMatch) match = answerBank[partialMatch];
    }
    
    return match || {
      answer: 'This question requires demonstrating relevant knowledge, providing specific examples, and showing practical understanding of the concepts involved. Structure your answer clearly and include real-world applications.',
      keywords: ['knowledge', 'examples', 'understanding', 'concepts', 'practical', 'experience'],
      concepts: ['expertise', 'experience', 'application', 'problem-solving']
    };
  };

  const calculateKeywordMatch = (answer, keywords) => {
    const foundKeywords = keywords.filter(keyword => 
      answer.includes(keyword.toLowerCase()) || 
      answer.includes(keyword.replace(/[.-]/g, '').toLowerCase())
    );
    return Math.round((foundKeywords.length / keywords.length) * 100);
  };

  const calculateConceptMatch = (answer, concepts) => {
    const foundConcepts = concepts.filter(concept => 
      answer.includes(concept.toLowerCase()) ||
      answer.includes(concept.replace(/\s+/g, '').toLowerCase())
    );
    return Math.round((foundConcepts.length / concepts.length) * 100);
  };

  const calculateStructureScore = (answer, type) => {
    const sentences = answer.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasIntro = sentences.length > 0 && sentences[0].length > 20;
    const hasExamples = hasGoodExamples(answer);
    const hasConclusion = sentences.length > 2;
    
    let score = 40; // Base score
    if (hasIntro) score += 20;
    if (hasExamples) score += 25;
    if (hasConclusion) score += 15;
    
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

  const checkKeywords = (answer, type) => {
    const keywords = {
      'technical': ['implement', 'design', 'algorithm', 'performance', 'optimize', 'architecture'],
      'behavioral': ['experience', 'team', 'challenge', 'learned', 'project', 'responsibility'],
      'scenario': ['approach', 'solution', 'consider', 'analyze', 'strategy', 'plan']
    };
    
    const typeKeywords = keywords[type] || [];
    return typeKeywords.filter(keyword => answer.toLowerCase().includes(keyword)).length;
  };

  const generateFeedback = (score, type) => {
    if (score >= 80) return `Excellent ${type} answer! Well structured and comprehensive.`;
    if (score >= 60) return `Good ${type} response. Could be more detailed.`;
    return `Basic ${type} answer. Needs more depth and examples.`;
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

  const finishInterview = async () => {
    try {
      // Calculate overall results
      const overallResults = calculateOverallResults();
      
      // Store results in localStorage for demo
      localStorage.setItem(`interview-${sessionId}`, JSON.stringify({
        answers,
        questionScores,
        overallResults,
        selectedRole
      }));

      navigate(`/results/${sessionId}`);
    } catch (error) {
      console.error('Error finishing interview:', error);
      alert('Failed to submit interview. Please try again.');
    }
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-blue-700">Evaluating your answer...</p>
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
              <p className="text-sm text-gray-700 mb-2">
                <strong>Feedback:</strong> {questionScores[currentQuestionIndex].feedback}
              </p>
              <div className="text-xs text-gray-600 mt-2">
                <span className="mr-4">Keywords Found: {questionScores[currentQuestionIndex].keywordsFound}%</span>
                <span>Concepts Covered: {questionScores[currentQuestionIndex].conceptsCovered}%</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded p-3 mb-3">
              <p className="text-sm font-medium text-blue-800 mb-2">Expected Answer:</p>
              <p className="text-sm text-blue-700">{questionScores[currentQuestionIndex].expectedAnswer}</p>
            </div>
            <div className="bg-white rounded p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">Suggestions for improvement:</p>
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