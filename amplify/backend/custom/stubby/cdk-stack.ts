import * as cdk from 'aws-cdk-lib';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { Construct } from 'constructs';
import {Fn, RemovalPolicy} from "aws-cdk-lib";
import {AttributeType, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {InlineCode, Runtime, StartingPosition, Function} from "aws-cdk-lib/aws-lambda";
import {Topic} from "aws-cdk-lib/aws-sns";
import {DynamoEventSource, SnsDlq} from "aws-cdk-lib/aws-lambda-event-sources";

export class cdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
      default: 'dev'
    });

    // Dynamo DB Tables
    const customTable = new Table(this, 'customTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING},
      timeToLiveAttribute: 'expirationDate',
      tableName: Fn.join('', ['custom-table', Fn.ref('env')]),
      stream: StreamViewType.OLD_IMAGE,
      removalPolicy: RemovalPolicy.DESTROY,
      pointInTimeRecovery: true,
    });

    const reactToTableLambda = new Function(this, 'reactiveLambda', {
      handler: "index.handler",
      code: new InlineCode('return'),
      runtime: Runtime.NODEJS_16_X
    });

    // SNS topic for DLQ
    const snsTopic = new Topic(this, 'reactiveLambdaFail', {
      displayName: 'Reactive Lambda Fail',
    });

    // lambda event source
    reactToTableLambda.addEventSource(new DynamoEventSource(customTable, {
      startingPosition: StartingPosition.LATEST,
      retryAttempts: 3,
      onFailure: new SnsDlq(snsTopic),
    }));
  }
}
