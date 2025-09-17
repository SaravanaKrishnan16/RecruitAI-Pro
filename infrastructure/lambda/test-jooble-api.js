/**
 * Simple test script for the Jooble API
 * Run with: node test-jooble-api.js
 */

const https = require('https');

/**
 * Fetch jobs from Jooble API
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} - Array of job listings
 */
async function fetchJoobleJobs(params) {
  return new Promise((resolve, reject) => {
    try {
      const url = "https://jooble.org/api/";
      const key = "6d39d9c8-918d-479e-9eb0-065f6c9e09b3"; // Jooble API key
      
      // Create job search parameters
      const requestParams = JSON.stringify({
        keywords: params.keywords || 'it',
        location: params.location || 'Bern',
        salary: params.salary || '',
        page: 1,
        limit: 20 // Increase limit to get more results
      });
      
      console.log(`Searching for jobs with parameters: ${requestParams}`);
      
      // Create request options
      const options = {
        hostname: 'jooble.org',
        path: `/api/${key}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestParams)
        }
      };
      
      // Create request
      const req = https.request(options, (res) => {
        let data = '';
        
        // Log status
        console.log(`API Status Code: ${res.statusCode}`);
        
        // Collect data chunks
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        // Process complete response
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.jobs && response.jobs.length > 0) {
              console.log(`Found ${response.jobs.length} jobs`);
              resolve(response.jobs);
            } else {
              console.log('No jobs found or error in API response');
              console.log('Response:', response);
              resolve([]);
            }
          } catch (error) {
            console.error('Error parsing Jooble API response:', error);
            reject(error);
          }
        });
      });
      
      // Handle request errors
      req.on('error', (error) => {
        console.error('Jooble API request error:', error);
        reject(error);
      });
      
      // Send the request with parameters
      req.write(requestParams);
      req.end();
      
    } catch (error) {
      console.error('Jooble API function error:', error);
      reject(error);
    }
  });
}

/**
 * Main test function
 */
async function testJoobleAPI() {
  try {
    // Get command line arguments or use defaults
    const args = process.argv.slice(2);
    const keywords = args[0] || 'software developer';
    const location = args[1] || 'London';
    
    console.log(`Searching for: ${keywords} in ${location}`);
    
    // Fetch jobs
    const jobs = await fetchJoobleJobs({
      keywords: keywords,
      location: location
    });
    
    // Display results
    if (jobs && jobs.length > 0) {
      console.log('\nJobs found:');
      jobs.forEach((job, index) => {
        console.log(`\n--- Job ${index + 1} ---`);
        console.log(`Title: ${job.title}`);
        console.log(`Company: ${job.company || 'Not specified'}`);
        console.log(`Location: ${job.location || 'Not specified'}`);
        console.log(`URL: ${job.link}`);
        console.log(`Description: ${job.snippet || job.description || 'No description'}`);
      });
    } else {
      console.log('No jobs found.');
    }
    
  } catch (error) {
    console.error('Error testing Jooble API:', error);
  }
}

// Run the test
testJoobleAPI();