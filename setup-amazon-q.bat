@echo off
echo Creating Amazon Q Business Application...

REM Create Amazon Q Business Application
aws qbusiness create-application ^
    --display-name "RecruitAI-Interview-Assistant" ^
    --description "AI-powered interview question generation" ^
    --role-arn "arn:aws:iam::%AWS_ACCOUNT_ID%:role/service-role/AmazonQServiceRole" ^
    --identity-center-instance-arn "arn:aws:sso:::instance/ssoins-xxxxxxxxxx" ^
    --query "applicationId" ^
    --output text > temp_app_id.txt

set /p APP_ID=<temp_app_id.txt
echo Amazon Q Application ID: %APP_ID%

REM Create Index
aws qbusiness create-index ^
    --application-id %APP_ID% ^
    --display-name "interview-knowledge-base" ^
    --description "Knowledge base for interview questions" ^
    --query "indexId" ^
    --output text > temp_index_id.txt

set /p INDEX_ID=<temp_index_id.txt
echo Index ID: %INDEX_ID%

REM Update .env file
echo REACT_APP_AMAZON_Q_APP_ID=%APP_ID% >> frontend\.env
echo AMAZON_Q_APP_ID=%APP_ID% >> frontend\.env
echo AMAZON_Q_INDEX_ID=%INDEX_ID% >> frontend\.env

echo.
echo Amazon Q Business Application created successfully!
echo Application ID: %APP_ID%
echo Index ID: %INDEX_ID%
echo.
echo Configuration added to frontend\.env

del temp_app_id.txt
del temp_index_id.txt
pause