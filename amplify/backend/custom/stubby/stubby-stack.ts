import {NestedStack, NestedStackProps, RemovalPolicy} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AttributeType, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {Function, InlineCode, Runtime, StartingPosition} from "aws-cdk-lib/aws-lambda";
import {Topic} from "aws-cdk-lib/aws-sns";
import {DynamoEventSource, SnsDlq} from "aws-cdk-lib/aws-lambda-event-sources";

export interface StubbyProps extends NestedStackProps {
    env: string
}
export class StubbyStack extends NestedStack {
    constructor(scope: Construct, id: string, props?: StubbyProps) {
        super(scope, id);

        // Dynamo DB Tables
        const customTable = new Table(this, 'customTable', {
            partitionKey: { name: 'id', type: AttributeType.STRING},
            timeToLiveAttribute: 'expirationDate',
            tableName: `custom-table-${props.env}`,
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
