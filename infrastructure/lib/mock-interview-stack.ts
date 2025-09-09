import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import { Construct } from 'constructs';

export class MockInterviewStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for resume storage
    const resumeBucket = new s3.Bucket(this, 'ResumeBucket', {
      bucketName: `mock-interview-resumes-${this.account}`,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // DynamoDB Tables
    const candidatesTable = new dynamodb.Table(this, 'CandidatesTable', {
      tableName: 'mock-interview-candidates',
      partitionKey: { name: 'candidateId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const interviewsTable = new dynamodb.Table(this, 'InterviewsTable', {
      tableName: 'mock-interview-sessions',
      partitionKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Cognito User Pool
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'mock-interview-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // IAM Role for Lambda functions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        AWSServicesAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['dynamodb:*', 's3:*', 'textract:*', 'comprehend:*', 'bedrock:*', 'transcribe:*'],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // Lambda Functions
    const resumeParserFunction = new lambda.Function(this, 'ResumeParserFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'resume-parser.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        CANDIDATES_TABLE: candidatesTable.tableName,
        RESUME_BUCKET: resumeBucket.bucketName,
      },
      timeout: cdk.Duration.minutes(5),
    });

    const questionGeneratorFunction = new lambda.Function(this, 'QuestionGeneratorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'question-generator.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        INTERVIEWS_TABLE: interviewsTable.tableName,
      },
      timeout: cdk.Duration.minutes(3),
    });

    const transcribeFunction = new lambda.Function(this, 'TranscribeFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'transcribe.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        INTERVIEWS_TABLE: interviewsTable.tableName,
      },
      timeout: cdk.Duration.minutes(5),
    });

    const evaluatorFunction = new lambda.Function(this, 'EvaluatorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'evaluator.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        INTERVIEWS_TABLE: interviewsTable.tableName,
        CANDIDATES_TABLE: candidatesTable.tableName,
      },
      timeout: cdk.Duration.minutes(3),
    });

    const jobFetcherFunction = new lambda.Function(this, 'JobFetcherFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'job-fetcher.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        CANDIDATES_TABLE: candidatesTable.tableName,
      },
      timeout: cdk.Duration.minutes(2),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'MockInterviewApi', {
      restApiName: 'Mock Interview Service',
      description: 'API for Mock Interview Assistant',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    const auth = new apigateway.CognitoUserPoolsAuthorizer(this, 'ApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // API Routes
    const resumeResource = api.root.addResource('resume');
    resumeResource.addMethod('POST', new apigateway.LambdaIntegration(resumeParserFunction), {
      authorizer: auth,
    });

    const interviewResource = api.root.addResource('interview');
    interviewResource.addMethod('POST', new apigateway.LambdaIntegration(questionGeneratorFunction), {
      authorizer: auth,
    });

    const transcribeResource = api.root.addResource('transcribe');
    transcribeResource.addMethod('POST', new apigateway.LambdaIntegration(transcribeFunction), {
      authorizer: auth,
    });

    const evaluateResource = api.root.addResource('evaluate');
    evaluateResource.addMethod('POST', new apigateway.LambdaIntegration(evaluatorFunction), {
      authorizer: auth,
    });

    const jobsResource = api.root.addResource('jobs');
    jobsResource.addMethod('GET', new apigateway.LambdaIntegration(jobFetcherFunction), {
      authorizer: auth,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'ResumeBucketName', {
      value: resumeBucket.bucketName,
      description: 'S3 Bucket for resumes',
    });
  }
}