import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AppStack } from '../infra/app-stack';

const testEnv = { account: '123456789012', region: 'us-east-2' };

function createStack() {
  const app = new cdk.App();
  return new AppStack(app, 'TestAppStack', {
    env: testEnv,
    subdomain: 'oura-console',
  });
}

describe('AppStack', () => {
  let template: Template;

  beforeAll(() => {
    template = Template.fromStack(createStack());
  });

  test('creates Docker Lambda function', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      PackageType: 'Image',
    });
  });

  test('creates ALB listener rules', () => {
    template.resourceCountIs('AWS::ElasticLoadBalancingV2::ListenerRule', 2);
  });

  test('creates Lambda target group', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
      TargetType: 'lambda',
    });
  });

  test('creates Cognito callback custom resource', () => {
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
  });
});
