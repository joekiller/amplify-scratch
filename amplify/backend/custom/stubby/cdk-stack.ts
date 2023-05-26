import * as cdk from 'aws-cdk-lib';
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper';
import { Construct } from 'constructs';
import {StubbyStack} from "./stubby-stack";
import {Fn} from "aws-cdk-lib";

export class cdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps, amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps) {
    super(scope, id, props);
    /* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
    new cdk.CfnParameter(this, 'env', {
      type: 'String',
      description: 'Current Amplify CLI env name',
    });

    new cdk.CfnParameter(this, 'build', {
      type: 'String',
      description: 'toggle if resource is built',
      default: 'False'
    });

    const buildEnabled = new cdk.CfnCondition(this, 'EnableBuild', {
      expression: Fn.conditionEquals('True', Fn.ref('build'))
    })
    const cfnStack = new StubbyStack(this, 'NestedStubbyStack', {env: Fn.ref('env')});
    const cfnBucket = cfnStack.node.defaultChild as cdk.CfnStack;
    cfnBucket.cfnOptions.condition = buildEnabled;
  }
}
