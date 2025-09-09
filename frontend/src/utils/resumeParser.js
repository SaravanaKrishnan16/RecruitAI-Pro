import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const parseResume = async (file) => {
  let text = '';
  
  try {
    console.log('File type:', file.type, 'File name:', file.name);
    
    if (file.type === 'application/pdf') {
      console.log('Processing PDF file...');
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded, pages:', pdf.numPages);
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        text += pageText + ' ';
      }
      console.log('Extracted text length:', text.length);
    } else if (file.type.includes('document') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      console.log('Processing Word document...');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
      console.log('Extracted text length:', text.length);
    } else {
      // For unsupported files, try to read as text
      console.log('Unsupported file type, trying as text...');
      text = await file.text();
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the file');
    }

    console.log('Analyzing text...');
    return analyzeResumeText(text);
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

const analyzeResumeText = (text) => {
  const lowerText = text.toLowerCase();
  
  // Extract skills
  const skills = extractSkills(lowerText);
  
  // Extract only explicit work/internship experience
  const experience = extractExperience(text);
  console.log('Extracted experience years (explicit only):', experience);
  
  // Extract education
  const education = extractEducation(text);
  
  // Extract contact info
  const contact = extractContact(text);
  
  // Calculate ATS score
  const atsScore = calculateATSScore(text, skills);
  
  // Determine domain
  const domain = determineDomain(skills);

  return {
    originalText: text,
    skills,
    experience,
    education,
    contact,
    atsScore,
    domain,
    wordCount: text.split(' ').length
  };
};

const extractSkills = (text) => {
  const skillCategories = {
    'Programming Languages': [
      'javascript', 'js', 'python', 'java', 'c++', 'cpp', 'c#', 'csharp', 'php', 'ruby', 'go', 'golang', 'rust', 'swift', 'kotlin', 'typescript', 'ts', 'scala', 'r programming', 'matlab', 'perl', 'shell', 'bash', 'powershell'
    ],
    'Web Technologies': [
      'html', 'html5', 'css', 'css3', 'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vuejs', 'node.js', 'nodejs', 'express', 'expressjs', 'django', 'flask', 'spring boot', 'spring', 'laravel', 'bootstrap', 'tailwind', 'sass', 'scss', 'webpack', 'vite', 'next.js', 'nextjs', 'nuxt', 'svelte'
    ],
    'Databases': [
      'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'sqlite', 'oracle', 'sql server', 'mssql', 'dynamodb', 'cassandra', 'elasticsearch', 'firebase', 'supabase', 'mariadb'
    ],
    'Cloud & DevOps': [
      'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github actions', 'terraform', 'ansible', 'puppet', 'chef', 'ci/cd', 'devops'
    ],
    'Data Science & AI': [
      'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence', 'ai', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'sklearn', 'jupyter', 'tableau', 'power bi', 'data analysis', 'statistics', 'nlp', 'computer vision'
    ],
    'Mobile Development': [
      'android', 'ios', 'react native', 'flutter', 'ionic', 'xamarin', 'cordova', 'swift', 'objective-c', 'kotlin', 'java android', 'mobile development'
    ],
    'Tools & Software': [
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'teams', 'figma', 'photoshop', 'illustrator', 'sketch', 'vs code', 'visual studio', 'intellij', 'eclipse'
    ]
  };

  const foundSkills = {};
  
  Object.entries(skillCategories).forEach(([category, skillList]) => {
    foundSkills[category] = skillList.filter(skill => {
      // Create regex for word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      return regex.test(text);
    });
  });

  return foundSkills;
};

const extractExperience = (text) => {
  const lowerText = text.toLowerCase();
  
  // Only look for explicit experience mentions with work keywords
  const explicitExperiencePatterns = [
    /(\d+)\+?[\s\-]*(?:years?|yrs?)\s*(?:of\s*)?(?:work\s*)?(?:experience|exp)(?:\s*in|\s*with|\s*working|\s*as)/gi,
    /(?:work|professional)\s*experience[:\s]*(\d+)\+?[\s\-]*(?:years?|yrs?)/gi
  ];

  let explicitYears = 0;
  
  explicitExperiencePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const years = match.match(/\d+/);
        if (years) {
          explicitYears = Math.max(explicitYears, parseInt(years[0]));
        }
      });
    }
  });

  // Only look for explicit internship mentions
  const internshipPatterns = [
    /intern(?:ship)?\s*at\s*[\w\s]+/gi,
    /intern(?:ship)?[\s\S]*?(?:company|organization|firm)/gi,
    /(\d+)\s*(?:months?|month)\s*intern(?:ship)?/gi,
    /intern(?:ship)?\s*(?:for|duration|period)[:\s]*(\d+)\s*(?:months?|month)/gi,
    /summer\s*intern(?:ship)?/gi,
    /intern(?:ship)?\s*(?:role|position)/gi
  ];

  let hasInternship = false;
  let internshipMonths = 0;
  
  internshipPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      hasInternship = true;
      matches.forEach(match => {
        const monthMatch = match.match(/(\d+)\s*(?:months?|month)/i);
        if (monthMatch) {
          internshipMonths += parseInt(monthMatch[1]);
        } else {
          internshipMonths += 3; // Default 3 months for unspecified internship
        }
      });
    }
  });

  const internshipYears = internshipMonths / 12;
  
  // Only return experience if explicitly mentioned or clear internship found
  if (explicitYears > 0) {
    return Math.min(explicitYears, 20);
  } else if (hasInternship) {
    return Math.min(internshipYears, 2); // Cap internship at 2 years
  }
  
  return 0; // No experience found
};

const extractEducation = (text) => {
  const degrees = [];
  const degreePatterns = [
    /\bb\.?tech\b/gi,
    /\bb\.?e\b/gi,
    /\bb\.?sc\b/gi,
    /\bb\.?com\b/gi,
    /\bb\.?a\b/gi,
    /\bm\.?tech\b/gi,
    /\bm\.?e\b/gi,
    /\bm\.?sc\b/gi,
    /\bm\.?com\b/gi,
    /\bm\.?a\b/gi,
    /\bmba\b/gi,
    /\bphd\b/gi,
    /\bbachelor\s+of\s+technology\b/gi,
    /\bbachelor\s+of\s+engineering\b/gi,
    /\bmaster\s+of\s+technology\b/gi,
    /\bmaster\s+of\s+engineering\b/gi
  ];

  degreePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim().toUpperCase();
        if (!degrees.includes(cleanMatch)) {
          degrees.push(cleanMatch);
        }
      });
    }
  });

  return degrees;
};

const extractContact = (text) => {
  const contact = {};
  
  // Email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  if (emailMatch) contact.email = emailMatch[0];
  
  // Phone
  const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];
  
  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];
  
  // GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) contact.github = githubMatch[0];

  return contact;
};

const calculateATSScore = (text, skills) => {
  let score = 20; // Lower base score
  const lowerText = text.toLowerCase();
  
  // Skills diversity and count (0-25 points)
  const totalSkills = Object.values(skills).flat().length;
  const skillCategories = Object.keys(skills).filter(cat => skills[cat].length > 0).length;
  score += Math.min(totalSkills * 1.8, 20);
  score += Math.min(skillCategories * 2, 8);
  
  // Action words and achievements (0-20 points)
  const actionWords = [
    'achieved', 'improved', 'increased', 'decreased', 'developed', 'created', 'designed', 'implemented', 
    'managed', 'led', 'coordinated', 'optimized', 'streamlined', 'delivered', 'built', 'established',
    'worked', 'completed', 'participated', 'contributed'
  ];
  const foundActions = actionWords.filter(word => lowerText.includes(word)).length;
  score += Math.min(foundActions * 2, 20);
  
  // Quantifiable results (0-12 points)
  const quantifiers = text.match(/\d+%|\$\d+|\d+\s*(?:million|thousand|k\b)|\d+x\s*(?:faster|improvement)|\d+\s*projects?/gi);
  if (quantifiers) score += Math.min(quantifiers.length * 3, 12);
  
  // Professional structure (0-12 points)
  const sections = ['experience', 'education', 'skills', 'projects', 'certifications'];
  const foundSections = sections.filter(section => lowerText.includes(section)).length;
  score += Math.min(foundSections * 2.5, 12);
  
  // Contact information (0-8 points)
  if (text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)) score += 4;
  if (text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/)) score += 2;
  if (lowerText.includes('linkedin') || lowerText.includes('github')) score += 2;
  
  // Content quality (0-10 points)
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 150) score += 3;
  if (wordCount > 300) score += 4;
  if (wordCount > 500) score += 3;
  
  // Small bonus for fresh graduates
  if (lowerText.includes('graduate') || lowerText.includes('fresher')) {
    score += 5;
  }
  
  return Math.min(Math.round(score), 80); // Cap at 80
};

const determineDomain = (skills) => {
  const domainScores = {};
  
  Object.entries(skills).forEach(([category, skillList]) => {
    if (skillList.length > 0) {
      domainScores[category] = skillList.length;
    }
  });
  
  if (Object.keys(domainScores).length === 0) return 'General';
  
  const topDomain = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a)[0];
  
  return topDomain[0];
};