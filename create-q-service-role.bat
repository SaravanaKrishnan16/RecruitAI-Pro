@echo off
echo Creating Amazon Q Service Role...

REM Create trust policy
echo { > trust-policy.json
echo   "Version": "2012-10-17", >> trust-policy.json
echo   "Statement": [ >> trust-policy.json
echo     { >> trust-policy.json
echo       "Effect": "Allow", >> trust-policy.json
echo       "Principal": { >> trust-policy.json
echo         "Service": "qbusiness.amazonaws.com" >> trust-policy.json
echo       }, >> trust-policy.json
echo       "Action": "sts:AssumeRole" >> trust-policy.json
echo     } >> trust-policy.json
echo   ] >> trust-policy.json
echo } >> trust-policy.json

REM Create IAM role
aws iam create-role ^
    --role-name AmazonQServiceRole ^
    --assume-role-policy-document file://trust-policy.json ^
    --description "Service role for Amazon Q Business"

REM Attach managed policy
aws iam attach-role-policy ^
    --role-name AmazonQServiceRole ^
    --policy-arn arn:aws:iam::aws:policy/AmazonQBusinessFullAccess

echo Amazon Q Service Role created successfully!
del trust-policy.json