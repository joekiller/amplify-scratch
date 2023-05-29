#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AugmentedAmplifyExportedBackend} from "../lib/AugmentedAmplifyExportedBackend";
import {EXPORT_PATH} from "../lib/util";
import {cdkStack} from "../lib/custom/customResourceCDK/cdk-stack";
let appId = process.env.AWS_APP_ID || undefined;
if(process.env.REMOTE_BACKEND_EXISTS != null) {
    // this is a Amplify build so avoid messing with the backend
    appId = undefined;
}

const env = process.env.ENV || process.env.USER_BRANCH || process.env.AWS_BRANCH || "dev"; // Specify your Amplify environment
const app = new cdk.App();
const backend = new AugmentedAmplifyExportedBackend(app, "exported", {
    amplifyEnvironment: env,
    amplifyAppId: appId,
    path: EXPORT_PATH,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT, // or for example: "172387324923"
        region: process.env.CDK_DEFAULT_REGION, // or "us-east-1"
    }
});
// sorta like `amplify add custom` with the resource name customResourceCDK
new cdkStack(backend.cfnInclude.stack, 'customResourceCDK', {amplifyResources: backend});
