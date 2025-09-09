import React, { useState, useEffect } from 'react';

const Jobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    salaryRange: '',
    company: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const allJobs = generateComprehensiveJobs();
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const filteredJobs = userProfile.selectedRole ? 
        filterJobsByRole(allJobs, userProfile.selectedRole) : allJobs;
      
      setJobs(filteredJobs);
      setCandidateProfile(userProfile);
      setLoading(false);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setLoading(false);
    }
  };

  const generateComprehensiveJobs = () => {
    const jobDatabase = [
      // Frontend Developer Jobs
      {
        jobId: 'fe-001',
        title: 'Senior Frontend Developer',
        company: 'Meta',
        location: 'Chennai',
        salary: '₹18,00,000 - ₹28,00,000',
        type: 'Full-time',
        description: 'Build next-generation user interfaces for billions of users. Work with React, GraphQL, and cutting-edge web technologies.',
        requirements: ['5+ years React', 'TypeScript', 'GraphQL', 'Performance optimization'],
        matchScore: 95,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 500) + 100,
        category: 'frontend-developer',
        companyLogo: '🔵',
        benefits: ['Health Insurance', 'Stock Options', 'Remote Work', '401k'],
        urgency: 'high'
      },
      {
        jobId: 'fe-002',
        title: 'React Developer',
        company: 'Netflix',
        location: 'Bengaluru',
        salary: '₹15,00,000 - ₹22,00,000',
        type: 'Full-time',
        description: 'Join our UI team to create engaging streaming experiences for millions of users worldwide.',
        requirements: ['React', 'Redux', 'JavaScript', 'CSS3', 'Testing'],
        matchScore: 88,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 300) + 50,
        category: 'frontend-developer',
        companyLogo: '🔴',
        benefits: ['Unlimited PTO', 'Health Insurance', 'Stock Options'],
        urgency: 'medium'
      },
      {
        jobId: 'fe-003',
        title: 'Frontend Engineer',
        company: 'Airbnb',
        location: 'Hyderabad',
        salary: '₹14,00,000 - ₹20,00,000',
        type: 'Full-time',
        description: 'Build beautiful, accessible interfaces for our global marketplace platform.',
        requirements: ['React', 'TypeScript', 'Accessibility', 'Design Systems'],
        matchScore: 92,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 400) + 75,
        category: 'frontend-developer',
        companyLogo: '🏠',
        benefits: ['Travel Credits', 'Health Insurance', 'Equity'],
        urgency: 'high'
      },

      // Backend Developer Jobs
      {
        jobId: 'be-001',
        title: 'Senior Backend Engineer',
        company: 'Google',
        location: 'Pune',
        salary: '₹20,00,000 - ₹30,00,000',
        type: 'Full-time',
        description: 'Design and build scalable backend systems serving billions of requests daily.',
        requirements: ['Java/Python', 'Distributed Systems', 'Microservices', 'Cloud'],
        matchScore: 94,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 600) + 200,
        category: 'backend-developer',
        companyLogo: '🟡',
        benefits: ['Health Insurance', 'Stock Options', 'Free Food', '20% Time'],
        urgency: 'high'
      },
      {
        jobId: 'be-002',
        title: 'Node.js Developer',
        company: 'Uber',
        location: 'Mumbai',
        salary: '₹16,00,000 - ₹24,00,000',
        type: 'Full-time',
        description: 'Build real-time systems powering millions of rides and deliveries globally.',
        requirements: ['Node.js', 'MongoDB', 'Redis', 'Microservices', 'AWS'],
        matchScore: 89,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 350) + 80,
        category: 'backend-developer',
        companyLogo: '⚫',
        benefits: ['Uber Credits', 'Health Insurance', 'Stock Options'],
        urgency: 'medium'
      },

      // Data Scientist Jobs
      {
        jobId: 'ds-001',
        title: 'Senior Data Scientist',
        company: 'Amazon',
        location: 'Noida',
        salary: '₹16,00,000 - ₹24,00,000',
        type: 'Full-time',
        description: 'Apply machine learning to improve customer experience and business operations.',
        requirements: ['Python', 'Machine Learning', 'AWS', 'Statistics', 'SQL'],
        matchScore: 91,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 400) + 120,
        category: 'data-scientist',
        companyLogo: '🟠',
        benefits: ['Stock Options', 'Health Insurance', 'Career Development'],
        urgency: 'high'
      },
      {
        jobId: 'ds-002',
        title: 'ML Engineer',
        company: 'OpenAI',
        location: 'Gurgaon',
        salary: '₹25,00,000 - ₹30,00,000',
        type: 'Full-time',
        description: 'Build and deploy large-scale machine learning systems for AI applications.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Distributed Systems'],
        matchScore: 96,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 800) + 300,
        category: 'machine-learning-engineer',
        companyLogo: '🤖',
        benefits: ['Equity', 'Health Insurance', 'Research Time'],
        urgency: 'high'
      },

      // DevOps Engineer Jobs
      {
        jobId: 'do-001',
        title: 'DevOps Engineer',
        company: 'Microsoft',
        location: 'Mumbai',
        salary: '₹18,00,000 - ₹26,00,000',
        type: 'Full-time',
        description: 'Build and maintain cloud infrastructure supporting millions of users.',
        requirements: ['Azure', 'Kubernetes', 'Terraform', 'CI/CD', 'Docker'],
        matchScore: 87,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 300) + 90,
        category: 'devops-engineer',
        companyLogo: '🔷',
        benefits: ['Health Insurance', 'Stock Purchase Plan', 'Flexible Hours'],
        urgency: 'medium'
      },

      // Mobile Developer Jobs
      {
        jobId: 'md-001',
        title: 'iOS Developer',
        company: 'Apple',
        location: 'Gurgaon',
        salary: '₹20,00,000 - ₹28,00,000',
        type: 'Full-time',
        description: 'Create innovative iOS applications used by millions worldwide.',
        requirements: ['Swift', 'iOS SDK', 'UIKit', 'SwiftUI', 'Core Data'],
        matchScore: 93,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 500) + 150,
        category: 'mobile-developer',
        companyLogo: '🍎',
        benefits: ['Employee Discount', 'Health Insurance', 'Stock Options'],
        urgency: 'high'
      },
      {
        jobId: 'md-002',
        title: 'React Native Developer',
        company: 'Instagram',
        location: 'Chennai',
        salary: '₹16,00,000 - ₹23,00,000',
        type: 'Full-time',
        description: 'Build mobile experiences for Instagram used by over 2 billion people.',
        requirements: ['React Native', 'JavaScript', 'Mobile UI/UX', 'Performance'],
        matchScore: 90,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 400) + 100,
        category: 'mobile-developer',
        companyLogo: '📸',
        benefits: ['Stock Options', 'Health Insurance', 'Wellness Programs'],
        urgency: 'high'
      },

      // UI/UX Designer Jobs
      {
        jobId: 'ux-001',
        title: 'Senior UX Designer',
        company: 'Adobe',
        location: 'Bengaluru',
        salary: '₹14,00,000 - ₹22,00,000',
        type: 'Full-time',
        description: 'Design intuitive user experiences for creative software used by millions.',
        requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        matchScore: 90,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 250) + 60,
        category: 'ui-ux-designer',
        companyLogo: '🔺',
        benefits: ['Creative Software', 'Health Insurance', 'Flexible PTO'],
        urgency: 'medium'
      },

      // Product Manager Jobs
      {
        jobId: 'pm-001',
        title: 'Senior Product Manager',
        company: 'Spotify',
        location: 'Delhi',
        salary: '₹15,00,000 - ₹22,00,000',
        type: 'Full-time',
        description: 'Drive product strategy for music streaming features used by 400M+ users.',
        requirements: ['Product Strategy', 'Analytics', 'Agile', 'User Research'],
        matchScore: 86,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 300) + 100,
        category: 'product-manager',
        companyLogo: '🟢',
        benefits: ['Spotify Premium', 'Health Insurance', 'Stock Options'],
        urgency: 'high'
      },

      // QA Engineer Jobs
      {
        jobId: 'qa-001',
        title: 'QA Automation Engineer',
        company: 'Tesla',
        location: 'Pune',
        salary: '₹10,00,000 - ₹18,00,000',
        type: 'Full-time',
        description: 'Ensure quality of software systems powering electric vehicles and energy products.',
        requirements: ['Selenium', 'Python', 'API Testing', 'CI/CD', 'Test Automation'],
        matchScore: 84,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 200) + 50,
        category: 'qa-engineer',
        companyLogo: '⚡',
        benefits: ['Stock Options', 'Health Insurance', 'Employee Discount'],
        urgency: 'medium'
      },

      // Cybersecurity Jobs
      {
        jobId: 'cs-001',
        title: 'Cybersecurity Analyst',
        company: 'Cloudflare',
        location: 'Mumbai',
        salary: '₹12,00,000 - ₹20,00,000',
        type: 'Full-time',
        description: 'Protect internet infrastructure and help build a better internet.',
        requirements: ['Network Security', 'Incident Response', 'SIEM', 'Risk Assessment'],
        matchScore: 88,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 180) + 40,
        category: 'cybersecurity-analyst',
        companyLogo: '🛡️',
        benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
        urgency: 'high'
      },

      // Cloud Architect Jobs
      {
        jobId: 'ca-001',
        title: 'Cloud Solutions Architect',
        company: 'AWS',
        location: 'Noida',
        salary: '₹22,00,000 - ₹30,00,000',
        type: 'Full-time',
        description: 'Design cloud architectures for enterprise customers and drive digital transformation.',
        requirements: ['AWS', 'Solution Architecture', 'Enterprise Sales', 'Technical Leadership'],
        matchScore: 92,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 300) + 80,
        category: 'cloud-architect',
        companyLogo: '☁️',
        benefits: ['Stock Options', 'Health Insurance', 'Travel Opportunities'],
        urgency: 'high'
      },

      // Blockchain Developer Jobs
      {
        jobId: 'bd-001',
        title: 'Blockchain Developer',
        company: 'Coinbase',
        location: 'Mumbai',
        salary: '₹12,00,000 - ₹18,00,000',
        type: 'Full-time',
        description: 'Build secure, scalable blockchain infrastructure for cryptocurrency trading.',
        requirements: ['Solidity', 'Ethereum', 'Web3', 'Smart Contracts', 'Security'],
        matchScore: 89,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 250) + 70,
        category: 'blockchain-developer',
        companyLogo: '⛓️',
        benefits: ['Crypto Benefits', 'Health Insurance', 'Stock Options'],
        urgency: 'medium'
      },

      // Game Developer Jobs
      {
        jobId: 'gd-001',
        title: 'Game Developer',
        company: 'Epic Games',
        location: 'Hyderabad',
        salary: '₹12,00,000 - ₹18,00,000',
        type: 'Full-time',
        description: 'Create immersive gaming experiences using Unreal Engine for millions of players.',
        requirements: ['Unreal Engine', 'C++', 'Game Design', '3D Graphics', 'Performance'],
        matchScore: 87,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 400) + 120,
        category: 'game-developer',
        companyLogo: '🎮',
        benefits: ['Game Credits', 'Health Insurance', 'Creative Environment'],
        urgency: 'medium'
      },

      // Systems Administrator Jobs
      {
        jobId: 'sa-001',
        title: 'Systems Administrator',
        company: 'Red Hat',
        location: 'Kochi',
        salary: '₹10,00,000 - ₹16,00,000',
        type: 'Full-time',
        description: 'Manage enterprise Linux systems and infrastructure for global operations.',
        requirements: ['Linux', 'Bash', 'Networking', 'Monitoring', 'Automation'],
        matchScore: 83,
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 150) + 30,
        category: 'systems-administrator',
        companyLogo: '🖥️',
        benefits: ['Health Insurance', 'Open Source Contributions', 'Learning Budget'],
        urgency: 'medium'
      },

      // Additional startup and mid-size company jobs
      ...generateStartupJobs()
    ];

    return jobDatabase.sort((a, b) => b.matchScore - a.matchScore);
  };

  const generateStartupJobs = () => {
    const startups = [
      { name: 'Stripe', logo: '💳', focus: 'Fintech' },
      { name: 'Shopify', logo: '🛒', focus: 'E-commerce' },
      { name: 'Slack', logo: '💬', focus: 'Communication' },
      { name: 'Zoom', logo: '📹', focus: 'Video Conferencing' },
      { name: 'Dropbox', logo: '📦', focus: 'Cloud Storage' },
      { name: 'Square', logo: '⬜', focus: 'Payments' },
      { name: 'Twilio', logo: '📞', focus: 'Communications API' },
      { name: 'GitHub', logo: '🐙', focus: 'Developer Tools' },
      { name: 'GitLab', logo: '🦊', focus: 'DevOps Platform' },
      { name: 'Atlassian', logo: '🔷', focus: 'Team Collaboration' }
    ];

    const roles = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Engineering Manager'];
    const locations = ['Remote', 'Chennai', 'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon'];
    
    return startups.flatMap((startup, index) => 
      roles.slice(0, 2).map((role, roleIndex) => ({
        jobId: `startup-${index}-${roleIndex}`,
        title: role,
        company: startup.name,
        location: locations[Math.floor(Math.random() * locations.length)],
        salary: `₹${10 + Math.floor(Math.random() * 5)},00,000 - ₹${18 + Math.floor(Math.random() * 8)},00,000`,
        type: Math.random() > 0.3 ? 'Full-time' : 'Remote',
        description: `Join ${startup.name} to build innovative ${startup.focus.toLowerCase()} solutions and scale technology platforms.`,
        requirements: ['Programming', 'Problem Solving', 'Team Collaboration', 'Agile'],
        matchScore: 70 + Math.floor(Math.random() * 25),
        postedDate: getRandomDate(),
        applicants: Math.floor(Math.random() * 200) + 30,
        category: 'fullstack-developer',
        companyLogo: startup.logo,
        benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
        urgency: Math.random() > 0.5 ? 'medium' : 'low'
      }))
    );
  };

  const filterJobsByRole = (jobs, selectedRole) => {
    const roleJobs = jobs.filter(job => job.category === selectedRole.id);
    const otherJobs = jobs.filter(job => job.category !== selectedRole.id);
    return [...roleJobs, ...otherJobs.slice(0, 15)];
  };

  const getRandomDate = () => {
    const days = Math.floor(Math.random() * 7) + 1;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 80) return 'text-blue-700 bg-blue-100 border-blue-200';
    if (score >= 70) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getUrgencyText = (urgency) => {
    switch(urgency) {
      case 'high': return 'Urgent Hiring';
      case 'medium': return 'Active Hiring';
      default: return 'Open Position';
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.jobType && job.type !== filters.jobType) {
      return false;
    }
    if (filters.company && !job.company.toLowerCase().includes(filters.company.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naukri-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-naukri-blue to-blue-600 rounded-lg p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2V4c0-1.11-.89-2-2-2H8c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM8 4h8v2H8V4zm12 15H4V8h16v11z"/>
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-3">
            <span className="text-4xl mr-3">💼</span>
            <h1 className="text-3xl font-bold">Job Recommendations</h1>
          </div>
          <p className="text-blue-100 text-lg mb-4">
            <span className="font-semibold">{jobs.length}+</span> live job opportunities from top companies • Updated in real-time
          </p>
          {candidateProfile && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">🎯 Target Role:</span>
                  <span className="font-semibold bg-white/20 px-2 py-1 rounded">
                    {candidateProfile.selectedRole?.title || 'All Roles'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">📊 ATS Score:</span>
                  <span className={`font-semibold px-2 py-1 rounded ${
                    candidateProfile.atsScore >= 70 ? 'bg-green-500/30' : 
                    candidateProfile.atsScore >= 50 ? 'bg-yellow-500/30' : 'bg-red-500/30'
                  }`}>
                    {candidateProfile.atsScore || 'Upload Resume'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-200">⚡ Status:</span>
                  <span className="font-semibold bg-green-500/30 px-2 py-1 rounded animate-pulse">
                    Active Searching
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          Filter Jobs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Chennai, Remote"
              className="input-field"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              className="input-field"
              value={filters.jobType}
              onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              placeholder="e.g. Google, Meta"
              className="input-field"
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
            <select
              className="input-field"
              value={filters.salaryRange}
              onChange={(e) => setFilters({ ...filters, salaryRange: e.target.value })}
            >
              <option value="">All Ranges</option>
              <option value="0-15L">₹0 - ₹15L</option>
              <option value="15L-25L">₹15L - ₹25L</option>
              <option value="25L-40L">₹25L - ₹40L</option>
              <option value="40L+">₹40L+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{filteredJobs.filter(j => j.matchScore >= 90).length}</div>
          <div className="text-sm text-green-700">Perfect Matches</div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{filteredJobs.filter(j => j.urgency === 'high').length}</div>
          <div className="text-sm text-blue-700">Urgent Hiring</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{filteredJobs.filter(j => j.type === 'Remote').length}</div>
          <div className="text-sm text-purple-700">Remote Jobs</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{new Set(filteredJobs.map(j => j.company)).size}</div>
          <div className="text-sm text-orange-700">Companies</div>
        </div>
      </div>

      {/* Job Results Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold flex items-center">
          <span className="text-2xl mr-2">🔍</span>
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
          {candidateProfile?.selectedRole && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              for {candidateProfile.selectedRole.title}
            </span>
          )}
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="input-field w-auto">
            <option>Match Score (High to Low)</option>
            <option>Date Posted (Recent)</option>
            <option>Salary (High to Low)</option>
            <option>Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Job Cards */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.jobId} className="job-card border-l-4 border-naukri-blue">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{job.companyLogo}</div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getMatchScoreColor(job.matchScore)}`}>
                      {job.matchScore}% Match
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                      {getUrgencyText(job.urgency)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <span className="font-medium text-lg">{job.company}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">{job.type}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 leading-relaxed">{job.description}</p>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Required Skills:</div>
              <div className="flex flex-wrap gap-2">
                {job.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Benefits:</div>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-200"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6 text-sm">
                <span className="font-semibold text-green-600 text-lg">{job.salary}</span>
                <span className="text-gray-500">Posted {job.postedDate}</span>
                <span className="text-gray-500">{job.applicants} applicants</span>
              </div>
              
              <div className="flex space-x-3">
                <button className="btn-secondary text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save
                </button>
                <button className="btn-primary text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
          <button 
            onClick={() => setFilters({ location: '', jobType: '', salaryRange: '', company: '' })}
            className="btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Jobs;