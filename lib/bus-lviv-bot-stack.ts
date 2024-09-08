import * as cdk from 'aws-cdk-lib';
import { aws_ssm, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';

const environmentName = process.env.NODE_ENV ?? 'dev';

export class BusLvivBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS SSM string parameters should be created manually
    const botToken = aws_ssm.StringParameter.valueForStringParameter(this, 'bus-lviv-bot-token');
    const apiUrl = aws_ssm.StringParameter.valueForStringParameter(this, 'bus-lviv-bot-api-url');

    const nodeJsFunctionProps: NodejsFunctionProps = {
      functionName: `bus-lviv-bot-${environmentName}`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      entry: path.join(__dirname, `/../functions/bus-lviv-bot/index.ts`),
      environment: {
        NODE_ENV: environmentName,
        BOT_TOKEN: botToken,
        API_URL: apiUrl,
      },
      bundling: {
        loader: { '.jpeg': 'file' },
        externalModules: [],
        nodeModules: ['@aws-lambda-powertools/logger'],
      },
    };

    const nodeJsFunction = new NodejsFunction(this, 'bus-lviv-bot', nodeJsFunctionProps);
    const lambdaUrl = nodeJsFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
    });

    new CfnOutput(this, 'FunctionUrl ', { value: lambdaUrl.url });
  }
}
