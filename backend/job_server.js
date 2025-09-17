/**
 * Job Search API Server
 * A standalone Node.js server that serves the job search API
 * Accessible at http://localhost:3000/jobs
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const jobsRouter = require('./jobs_api');

// Import the job-fetcher directly to ensure we're using the same code
const jobFetcher = require('../infrastructure/lambda/job-fetcher');

const app = express();
const port = 3000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Parse JSON requests
app.use(express.json());

// Mount the jobs API router
app.use('/api/jobs', jobsRouter);

// Serve the job search HTML file at /jobs
app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'test-jooble-api.html'));
});

// Default route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>RecruitAI Pro Job API</title></head>
      <body>
        <h1>RecruitAI Pro Job Search API</h1>
        <p>This server provides job search functionality using the Jooble API.</p>
        <p>Visit <a href="/jobs">/jobs</a> to use the job search interface.</p>
        <p>API endpoints:</p>
        <ul>
          <li>GET /api/jobs?keywords=software&location=London</li>
          <li>POST /api/jobs (with JSON body: { "keywords": "software", "location": "London" })</li>
        </ul>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Job search server running at http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/jobs to search for jobs`);
  console.log(`API endpoint: http://localhost:${port}/api/jobs`);
});