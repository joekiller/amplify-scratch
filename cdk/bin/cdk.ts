#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {AugmentedAmplifyExportedBackend} from "../lib/AugmentedAmplifyExportedBackend";
import {EXPORT_PATH} from "../lib/util"; // To resolve the path to your exported Amplify backend assets
let appId = process.env.AWS_APP_ID || undefined;
if(process.env.REMOTE_BACKEND_EXISTS != null) {
    // this is a Amplify build so avoid messing with the backend
    appId = undefined;
}

const env = process.env.USER_BRANCH || process.env.AWS_BRANCH || "dev"; // Specify your Amplify environment
const app = new cdk.App();
new AugmentedAmplifyExportedBackend(app, "exported", {
    amplifyEnvironment: env,
    amplifyAppId: appId,
    path: EXPORT_PATH
});
