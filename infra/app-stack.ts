import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { ValidicLabsApp } from '@validic-labs/cdk-sso';
import * as path from 'path';

export interface AppStackProps extends cdk.StackProps {
  readonly subdomain: string;
  readonly memorySize?: number;
  readonly timeout?: cdk.Duration;
  readonly environment?: Record<string, string>;
}

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const appFn = new lambda.DockerImageFunction(this, 'AppFn', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '..'), {
        file: 'Dockerfile',
        platform: ecr_assets.Platform.LINUX_AMD64,
      }),
      memorySize: props.memorySize ?? 512,
      timeout: props.timeout ?? cdk.Duration.seconds(30),
      environment: {
        ...props.environment,
        AWS_LWA_READINESS_CHECK_PATH: '/api/health',
        AWS_LWA_READINESS_CHECK_MIN_UNHEALTHY_STATUS: '500',
      },
      logGroup: new logs.LogGroup(this, 'AppFnLogs', {
        retention: logs.RetentionDays.THREE_MONTHS,
      }),
    });

    new ValidicLabsApp(this, 'Registration', {
      lambdaFunction: appFn,
      subdomain: props.subdomain,
      healthCheckPath: '/api/health',
    });
  }
}
