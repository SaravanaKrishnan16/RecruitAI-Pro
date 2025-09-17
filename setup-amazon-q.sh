#!/bin/bash
echo "Creating Amazon Q Business Application..."

# Create Amazon Q Business Application
APP_ID=$(aws qbusiness create-application \
    --display-name "RecruitAI-Interview-Assistant" \
    --description "AI-powered interview question generation" \
    --role-arn "arn:aws:iam::$AWS_ACCOUNT_ID:role/service-role/AmazonQServiceRole" \
    --identity-center-instance-arn "arn:aws:sso:::instance/ssoins-xxxxxxxxxx" \
    --query "applicationId" \
    --output text)

echo "Amazon Q Application ID: $APP_ID"

# Create Index
INDEX_ID=$(aws qbusiness create-index \
    --application-id $APP_ID \
    --display-name "interview-knowledge-base" \
    --description "Knowledge base for interview questions" \
    --query "indexId" \
    --output text)

echo "Index ID: $INDEX_ID"

# Update .env file
echo "REACT_APP_AMAZON_Q_APP_ID=$APP_ID" >> frontend/.env
echo "AMAZON_Q_APP_ID=$APP_ID" >> frontend/.env
echo "AMAZON_Q_INDEX_ID=$INDEX_ID" >> frontend/.env

echo ""
echo "Amazon Q Business Application created successfully!"
echo "Application ID: $APP_ID"
echo "Index ID: $INDEX_ID"
echo ""
echo "Configuration added to frontend/.env"