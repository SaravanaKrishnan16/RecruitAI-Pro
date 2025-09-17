const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Specific route for /jobs that serves the test-jooble-api.html file
app.get('/jobs', (req, res) => {
  const filePath = path.join(__dirname, 'test-jooble-api.html');
  
  // Read the HTML file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Error loading job search page');
    }
    
    res.send(data);
  });
});

// Handle API proxy requests to avoid CORS issues
app.post('/jooble-api-proxy', express.json(), (req, res) => {
  const https = require('https');
  const apiKey = "6d39d9c8-918d-479e-9eb0-065f6c9e09b3";
  
  // Get parameters from the request body
  const { keywords, location, page, limit } = req.body;
  
  // Create parameters for Jooble API
  const params = JSON.stringify({
    keywords: keywords || 'it',
    location: location || 'Bern',
    page: page || 1,
    limit: limit || 20
  });
  
  // Set up the request options
  const options = {
    hostname: 'jooble.org',
    path: `/api/${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(params)
    }
  };
  
  // Make the request to Jooble API
  const request = https.request(options, (apiRes) => {
    let data = '';
    
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    
    apiRes.on('end', () => {
      try {
        // Try to parse the response
        const jsonData = JSON.parse(data);
        
        // Send the response back to the client
        res.json(jsonData);
      } catch (error) {
        console.error('Error parsing API response:', error);
        res.status(500).json({ error: 'Failed to parse API response' });
      }
    });
  });
  
  request.on('error', (error) => {
    console.error('Error making API request:', error);
    res.status(500).json({ error: 'Failed to connect to Jooble API' });
  });
  
  // Send the request with the parameters
  request.write(params);
  request.end();
});

// Start the server
app.listen(port, () => {
  console.log(`Job search server running at http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/jobs to search for jobs`);
});