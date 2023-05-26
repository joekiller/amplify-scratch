#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AugmentedAmplifyExportedBackend} from "../lib/AugmentedAmplifyExportedBackend";
import {EXPORT_PATH} from "../lib/util"; // To resolve the path to your exported Amplify backend assets

const appId = process.env.AWS_APP_ID || undefined;
const env = process.env.USER_BRANCH || process.env.AWS_BRANCH || "dev"; // Specify your Amplify environment
const app = new cdk.App();
new AugmentedAmplifyExportedBackend(app, "exported", {
    amplifyEnvironment: env,
    amplifyAppId: appId,
    path: EXPORT_PATH
});
