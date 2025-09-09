export const allRoles = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    icon: '🎨',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Git'],
    questions: [
      { question: 'Explain the difference between let, const, and var in JavaScript.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you optimize React component performance?', type: 'technical', difficulty: 'hard' },
      { question: 'What is the CSS box model and how does it work?', type: 'technical', difficulty: 'easy' },
      { question: 'Describe your experience with responsive web design.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you handle cross-browser compatibility issues?', type: 'technical', difficulty: 'medium' },
      { question: 'What are React hooks and why are they useful?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you ensure web accessibility in your applications?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a challenging frontend project you worked on.', type: 'behavioral', difficulty: 'easy' },
      { question: 'How do you manage state in a React application?', type: 'technical', difficulty: 'hard' },
      { question: 'What tools do you use for debugging frontend issues?', type: 'technical', difficulty: 'easy' }
    ]
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    icon: '⚙️',
    requiredSkills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Database Design', 'Git'],
    questions: [
      { question: 'Explain the difference between SQL and NoSQL databases.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you design a RESTful API?', type: 'technical', difficulty: 'medium' },
      { question: 'What is database indexing and why is it important?', type: 'technical', difficulty: 'hard' },
      { question: 'How do you handle authentication and authorization?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your experience with microservices architecture.', type: 'behavioral', difficulty: 'hard' },
      { question: 'How do you optimize database queries for performance?', type: 'technical', difficulty: 'hard' },
      { question: 'What are the principles of good API design?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle error handling in backend applications?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a complex backend system you built.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure data security in your applications?', type: 'technical', difficulty: 'medium' }
    ]
  },
  {
    id: 'fullstack-developer',
    title: 'Full Stack Developer',
    icon: '🔄',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs'],
    questions: [
      { question: 'How do you structure a full-stack application?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain the communication between frontend and backend.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle state management across the full stack?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your development workflow for full-stack projects.', type: 'behavioral', difficulty: 'easy' },
      { question: 'How do you ensure consistency between frontend and backend?', type: 'technical', difficulty: 'medium' },
      { question: 'What challenges have you faced in full-stack development?', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you handle real-time data synchronization?', type: 'technical', difficulty: 'hard' },
      { question: 'Explain your approach to testing full-stack applications.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you optimize performance across the entire stack?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your experience with deployment and DevOps.', type: 'behavioral', difficulty: 'medium' }
    ]
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    icon: '📊',
    requiredSkills: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas', 'NumPy'],
    questions: [
      { question: 'Explain the difference between supervised and unsupervised learning.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle missing data in datasets?', type: 'technical', difficulty: 'medium' },
      { question: 'What is overfitting and how do you prevent it?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your approach to feature engineering.', type: 'technical', difficulty: 'hard' },
      { question: 'How do you evaluate the performance of a machine learning model?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain the bias-variance tradeoff.', type: 'technical', difficulty: 'hard' },
      { question: 'Describe a data science project you are proud of.', type: 'behavioral', difficulty: 'easy' },
      { question: 'How do you communicate technical findings to non-technical stakeholders?', type: 'behavioral', difficulty: 'medium' },
      { question: 'What is your process for data cleaning and preprocessing?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you choose the right algorithm for a problem?', type: 'technical', difficulty: 'hard' }
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    icon: '🔧',
    requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'],
    questions: [
      { question: 'Explain the concept of Infrastructure as Code.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you implement CI/CD pipelines?', type: 'technical', difficulty: 'medium' },
      { question: 'What is containerization and why is it useful?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you monitor and troubleshoot production systems?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your experience with cloud platforms.', type: 'behavioral', difficulty: 'easy' },
      { question: 'How do you ensure security in DevOps practices?', type: 'technical', difficulty: 'medium' },
      { question: 'What is the difference between Docker and Kubernetes?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle deployment rollbacks?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a challenging DevOps problem you solved.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you implement automated testing in CI/CD?', type: 'technical', difficulty: 'hard' }
    ]
  },
  {
    id: 'mobile-developer',
    title: 'Mobile Developer',
    icon: '📱',
    requiredSkills: ['React Native', 'Flutter', 'iOS', 'Android', 'JavaScript', 'Git'],
    questions: [
      { question: 'Compare React Native and Flutter for mobile development.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle different screen sizes in mobile apps?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain the mobile app lifecycle.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you optimize mobile app performance?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your experience with app store deployment.', type: 'behavioral', difficulty: 'easy' },
      { question: 'How do you handle offline functionality in mobile apps?', type: 'technical', difficulty: 'hard' },
      { question: 'What are the key differences between iOS and Android development?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you implement push notifications?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a challenging mobile project you worked on.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure mobile app security?', type: 'technical', difficulty: 'medium' }
    ]
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    icon: '🎨',
    requiredSkills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing'],
    questions: [
      { question: 'Explain your design process from concept to final product.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you conduct user research and usability testing?', type: 'technical', difficulty: 'medium' },
      { question: 'What is the difference between UI and UX design?', type: 'technical', difficulty: 'easy' },
      { question: 'How do you ensure accessibility in your designs?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a time when you had to redesign based on user feedback.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you create and maintain design systems?', type: 'technical', difficulty: 'hard' },
      { question: 'What tools do you use for prototyping and why?', type: 'technical', difficulty: 'easy' },
      { question: 'How do you collaborate with developers during implementation?', type: 'behavioral', difficulty: 'medium' },
      { question: 'Explain the principles of good visual hierarchy.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you measure the success of your designs?', type: 'technical', difficulty: 'hard' }
    ]
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    icon: '📋',
    requiredSkills: ['Product Strategy', 'Analytics', 'Agile', 'User Research', 'Roadmapping', 'Stakeholder Management'],
    questions: [
      { question: 'How do you prioritize features in a product roadmap?', type: 'behavioral', difficulty: 'medium' },
      { question: 'Describe your approach to gathering product requirements.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you measure product success and KPIs?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain how you would launch a new product feature.', type: 'behavioral', difficulty: 'hard' },
      { question: 'How do you handle conflicting stakeholder requirements?', type: 'behavioral', difficulty: 'medium' },
      { question: 'Describe your experience with A/B testing.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you work with engineering teams to deliver products?', type: 'behavioral', difficulty: 'easy' },
      { question: 'What frameworks do you use for product decision making?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you conduct competitive analysis?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a product failure and what you learned from it.', type: 'behavioral', difficulty: 'hard' }
    ]
  },
  {
    id: 'qa-engineer',
    title: 'QA Engineer',
    icon: '🔍',
    requiredSkills: ['Test Automation', 'Selenium', 'API Testing', 'Bug Tracking', 'Test Planning', 'Quality Assurance'],
    questions: [
      { question: 'Explain the difference between manual and automated testing.', type: 'technical', difficulty: 'easy' },
      { question: 'How do you design test cases for a new feature?', type: 'technical', difficulty: 'medium' },
      { question: 'What is your approach to API testing?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle flaky tests in automation?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your experience with performance testing.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure test coverage across different environments?', type: 'technical', difficulty: 'medium' },
      { question: 'What tools do you use for test automation and why?', type: 'technical', difficulty: 'easy' },
      { question: 'How do you collaborate with developers on bug fixes?', type: 'behavioral', difficulty: 'easy' },
      { question: 'Explain your approach to regression testing.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you prioritize bugs and testing efforts?', type: 'behavioral', difficulty: 'medium' }
    ]
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    icon: '🔒',
    requiredSkills: ['Network Security', 'Incident Response', 'Risk Assessment', 'Penetration Testing', 'SIEM', 'Compliance'],
    questions: [
      { question: 'Explain the CIA triad in cybersecurity.', type: 'technical', difficulty: 'easy' },
      { question: 'How do you conduct a security risk assessment?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your incident response process.', type: 'behavioral', difficulty: 'medium' },
      { question: 'What are the common types of cyber attacks and how do you prevent them?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you stay updated with the latest security threats?', type: 'behavioral', difficulty: 'easy' },
      { question: 'Explain the concept of zero-trust security.', type: 'technical', difficulty: 'hard' },
      { question: 'How do you perform vulnerability assessments?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your experience with compliance frameworks.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you implement security monitoring and alerting?', type: 'technical', difficulty: 'hard' },
      { question: 'What is your approach to security awareness training?', type: 'behavioral', difficulty: 'medium' }
    ]
  },
  {
    id: 'cloud-architect',
    title: 'Cloud Architect',
    icon: '☁️',
    requiredSkills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Kubernetes', 'Microservices'],
    questions: [
      { question: 'How do you design a scalable cloud architecture?', type: 'technical', difficulty: 'hard' },
      { question: 'Compare different cloud service models (IaaS, PaaS, SaaS).', type: 'technical', difficulty: 'medium' },
      { question: 'How do you ensure high availability in cloud systems?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your approach to cloud cost optimization.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you implement disaster recovery in the cloud?', type: 'technical', difficulty: 'hard' },
      { question: 'What are the security considerations for cloud architecture?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you migrate legacy systems to the cloud?', type: 'behavioral', difficulty: 'hard' },
      { question: 'Explain the concept of serverless architecture.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you monitor and troubleshoot cloud applications?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a complex cloud project you architected.', type: 'behavioral', difficulty: 'medium' }
    ]
  },
  {
    id: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    icon: '🤖',
    requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'Kubernetes'],
    questions: [
      { question: 'How do you deploy machine learning models to production?', type: 'technical', difficulty: 'hard' },
      { question: 'Explain the concept of model versioning and monitoring.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle data drift in production ML systems?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your approach to A/B testing ML models.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you optimize model performance and latency?', type: 'technical', difficulty: 'hard' },
      { question: 'What is your experience with MLOps and CI/CD for ML?', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you ensure reproducibility in ML experiments?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain the challenges of scaling ML systems.', type: 'technical', difficulty: 'hard' },
      { question: 'How do you handle model bias and fairness?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a challenging ML deployment you worked on.', type: 'behavioral', difficulty: 'medium' }
    ]
  },
  {
    id: 'blockchain-developer',
    title: 'Blockchain Developer',
    icon: '⛓️',
    requiredSkills: ['Solidity', 'Ethereum', 'Web3', 'Smart Contracts', 'JavaScript', 'Cryptography'],
    questions: [
      { question: 'Explain how blockchain technology works.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you write and deploy smart contracts?', type: 'technical', difficulty: 'medium' },
      { question: 'What are the security considerations in blockchain development?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe your experience with different blockchain platforms.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you handle gas optimization in Ethereum?', type: 'technical', difficulty: 'hard' },
      { question: 'Explain the concept of consensus mechanisms.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you test smart contracts?', type: 'technical', difficulty: 'medium' },
      { question: 'What is your approach to DApp development?', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you integrate blockchain with traditional systems?', type: 'technical', difficulty: 'hard' },
      { question: 'Describe a blockchain project you are proud of.', type: 'behavioral', difficulty: 'easy' }
    ]
  },
  {
    id: 'game-developer',
    title: 'Game Developer',
    icon: '🎮',
    requiredSkills: ['Unity', 'C#', 'Unreal Engine', 'Game Design', '3D Graphics', 'Physics'],
    questions: [
      { question: 'Compare Unity and Unreal Engine for game development.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you optimize game performance across different platforms?', type: 'technical', difficulty: 'hard' },
      { question: 'Explain the game development lifecycle.', type: 'technical', difficulty: 'medium' },
      { question: 'Describe your approach to game physics and collision detection.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you handle multiplayer networking in games?', type: 'technical', difficulty: 'hard' },
      { question: 'What is your experience with game monetization strategies?', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you implement AI behavior in games?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a challenging game feature you implemented.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you balance gameplay mechanics?', type: 'behavioral', difficulty: 'medium' },
      { question: 'What tools do you use for game asset creation and management?', type: 'technical', difficulty: 'easy' }
    ]
  },
  {
    id: 'systems-administrator',
    title: 'Systems Administrator',
    icon: '🖥️',
    requiredSkills: ['Linux', 'Windows Server', 'Networking', 'Bash', 'PowerShell', 'Monitoring'],
    questions: [
      { question: 'How do you troubleshoot server performance issues?', type: 'technical', difficulty: 'medium' },
      { question: 'Explain your approach to system backup and recovery.', type: 'technical', difficulty: 'medium' },
      { question: 'How do you manage user accounts and permissions?', type: 'technical', difficulty: 'easy' },
      { question: 'Describe your experience with network configuration and troubleshooting.', type: 'behavioral', difficulty: 'medium' },
      { question: 'How do you implement system monitoring and alerting?', type: 'technical', difficulty: 'medium' },
      { question: 'What is your approach to patch management?', type: 'technical', difficulty: 'medium' },
      { question: 'How do you ensure system security and compliance?', type: 'technical', difficulty: 'medium' },
      { question: 'Describe a critical system outage you resolved.', type: 'behavioral', difficulty: 'hard' },
      { question: 'How do you automate routine administrative tasks?', type: 'technical', difficulty: 'medium' },
      { question: 'What tools do you use for system administration and why?', type: 'technical', difficulty: 'easy' }
    ]
  }
];