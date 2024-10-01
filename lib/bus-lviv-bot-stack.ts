import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class BusLvivBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS SSM string parameters should be created manually
    const botToken = StringParameter.valueForStringParameter(this, 'bus-lviv-bot-token');
    const apiUrl = StringParameter.valueForStringParameter(this, 'bus-lviv-bot-api-url');

    const nodeJsFunctionProps: NodejsFunctionProps = {
      functionName: `bus-lviv-bot`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      entry: path.join(__dirname, `/../functions/bus-lviv-bot/index.ts`),
      environment: {
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

    new StringParameter(this, 'bus-lviv-bot-function-url', {
      parameterName: 'bus-lviv-bot-function-url',
      stringValue: lambdaUrl.url,
    });
  }
}
