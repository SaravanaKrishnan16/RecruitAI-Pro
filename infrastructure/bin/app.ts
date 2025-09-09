#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MockInterviewStack } from '../lib/mock-interview-stack';

const app = new cdk.App();
new MockInterviewStack(app, 'MockInterviewStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});