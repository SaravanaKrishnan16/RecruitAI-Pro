/**
 * Job Search API Router
 * This file provides job search API endpoints integrated with the backend
 */

const express = require('express');
const https = require('https');
const router = express.Router();
const jobFetcher = require('../infrastructure/lambda/job-fetcher');

// Jooble API key
const JOOBLE_API_KEY = "6d39d9c8-918d-479e-9eb0-065f6c9e09b3";

/**
 * Search for jobs using the Jooble API
 * GET /api/jobs?keywords=software&location=London
 * POST /api/jobs with JSON body: { "keywords": "software", "location": "London" }
 */
router.get('/', (req, res) => {
  const { keywords, location } = req.query;
  searchJobs(keywords, location, req, res);
});

router.post('/', express.json(), (req, res) => {
  const { keywords, location } = req.body;
  searchJobs(keywords, location, req, res);
});

/**
 * Helper function to search for jobs
 */
async function searchJobs(keywords, location, req, res) {
  console.log(`Job search: ${keywords} in ${location}`);
  
  try {
    // Create a mock event object like what AWS Lambda would receive
    const mockEvent = {
      queryStringParameters: {
        keywords: keywords || 'it',
        location: location || 'Bern'
      }
    };
    
    // Call the Lambda handler directly
    const lambdaResponse = await jobFetcher.handler(mockEvent);
    
    if (lambdaResponse.statusCode === 200) {
      // The lambda returns stringified JSON, so parse it
      const responseBody = JSON.parse(lambdaResponse.body);
      res.json(responseBody);
    } else {
      console.error('Error from job-fetcher:', lambdaResponse);
      res.status(lambdaResponse.statusCode || 500).json({ 
        error: 'Failed to fetch jobs',
        details: lambdaResponse.body
      });
    }
  } catch (error) {
    console.error('Error calling job-fetcher:', error);
    res.status(500).json({ 
      error: 'Failed to process job search',
      message: error.message
    });
  }
}

module.exports = router;