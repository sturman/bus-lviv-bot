import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import * as path from 'node:path';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Dashboard, LogQueryVisualizationType, LogQueryWidget } from 'aws-cdk-lib/aws-cloudwatch';

export class BusLvivBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS SSM string parameters should be created manually
    const botToken = StringParameter.valueForStringParameter(this, 'bus-lviv-bot-token');
    const apiUrl = StringParameter.valueForStringParameter(this, 'bus-lviv-bot-api-url');

    const nodeJsFunctionProps: NodejsFunctionProps = {
      functionName: `bus-lviv-bot`,
      runtime: lambda.Runtime.NODEJS_24_X,
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

    const dashboard = new Dashboard(this, 'bus-lviv-bot-cw-dashboard', {
      dashboardName: 'bus-lviv-bot',
    });
    const logQueryWidget = new LogQueryWidget({
      logGroupNames: [nodeJsFunction.logGroup.logGroupName],
      view: LogQueryVisualizationType.TABLE,
      width: 24,
      height: 18,
      queryLines: [
        'fields ' +
          '@timestamp, level, body.message.chat.first_name as first_name, body.message.chat.last_name as last_name, ' +
          'body.message.chat.username as username, ' +
          'body.message.text as text, body.message.location.latitude as latitude, body.message.location.longitude as longitude',
        'filter @message like /update_id/',
      ],
    });
    dashboard.addWidgets(logQueryWidget);
    const uniqueUsersWidget = new LogQueryWidget({
      logGroupNames: [nodeJsFunction.logGroup.logGroupName],
      view: LogQueryVisualizationType.TABLE,
      width: 4,
      height: 4,
      queryLines: ['stats count_distinct(body.message.from.id) as unique_users'],
    });
    dashboard.addWidgets(uniqueUsersWidget);
  }
}
