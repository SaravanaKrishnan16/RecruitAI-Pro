/**
 * Mock AWS SDK for local development
 * This avoids errors when importing the job-fetcher module that uses AWS services
 */

class DynamoDBDocumentClient {
  constructor() {}
  
  get(params) {
    return {
      promise: () => Promise.resolve({
        Item: null // No items found in local mode
      })
    };
  }
}

class BedrockAgent {
  constructor() {}
  
  invokeAgent(params) {
    return {
      promise: () => Promise.resolve({
        // Mock response
        completion: "This is a mock response from Bedrock agent"
      })
    };
  }
}

module.exports = {
  DynamoDB: {
    DocumentClient: DynamoDBDocumentClient
  },
  BedrockAgent: BedrockAgent
};