#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../infra/app-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const stack = new AppStack(app, 'ValidicLabsOuraConsoleStack', {
  env,
  description: 'Oura API Console behind Validic Labs shared auth at oura-console.validiclabs.com',
  subdomain: 'oura-console',
  environment: {
    APP_NAME: 'oura-console',
  },
});

// REQUIRED: Billing tags for cost tracking
cdk.Tags.of(stack).add('Project', 'validic-labs');
cdk.Tags.of(stack).add('App', 'oura-console');
cdk.Tags.of(stack).add('Environment', 'production');
cdk.Tags.of(stack).add('ManagedBy', 'cdk');
cdk.Tags.of(stack).add('CostCenter', 'validic-labs-oura-console');

app.synth();
