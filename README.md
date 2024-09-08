# [bus-lviv-bot](https://t.me/bus_lviv_bot)

### Environment variables

`BOT_TOKEN` - Telegram bot token

### Serverless
* add token to AWS Parameters Store `aws ssm put-parameter --name "bus-lviv-bot-token" --type "String" --value "<TOKEN>"`
* add API URL to AWS Parameters Store `aws ssm put-parameter --name "bus-lviv-bot-api-url" --type "String" --value "<API_URL>"`

------------
Built with

[telegraf.js](https://github.com/telegraf/telegraf)

[AWS CDK](https://github.com/aws/aws-cdk)

[AWS Lambda](https://aws.amazon.com/lambda/)
