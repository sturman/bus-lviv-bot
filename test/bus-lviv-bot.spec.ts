import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BusLvivBotStack } from '../lib/bus-lviv-bot-stack';

let template: Template;

describe('BusLvivBotStack', () => {
  beforeAll(() => {
    const app = new cdk.App();
    const stack = new BusLvivBotStack(app, 'bus-lviv-bot-stack', {});
    template = Template.fromStack(stack);
  });

  it('Lambda Function created', () => {
    template.hasResource('AWS::Lambda::Function', {});
  });

  // The handlers call the API with a 5s axios timeout; the Lambda must outlive it so the user
  // gets the error reply and Telegram does not redeliver the update.
  it('Lambda timeout is longer than the upstream API timeout', () => {
    template.hasResourceProperties('AWS::Lambda::Function', { Timeout: 15 });
  });

  it('Lambda Function URL created', () => {
    template.hasResource('AWS::Lambda::Url', {});
  });

  it('SSM parameter created', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: 'bus-lviv-bot-function-url',
      Type: 'String',
    });
  });

  it('CloudWatch Dashboard created', () => {
    template.hasResource('AWS::CloudWatch::Dashboard', {});
  });
});
