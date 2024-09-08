#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BusLvivBotStack } from '../lib/bus-lviv-bot-stack';

const app = new cdk.App();
new BusLvivBotStack(app, 'BusLvivBotStack', {});
