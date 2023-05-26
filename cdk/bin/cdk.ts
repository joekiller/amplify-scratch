#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AmplifyExportedBackend } from '@aws-amplify/cdk-exported-backend'
import * as path from 'path' // To resolve the path to your exported Amplify backend assets

const app = new cdk.App();
const backend = new AmplifyExportedBackend(app, "exported", {
    amplifyEnvironment: process.env.USER_BRANCH || process.env.AWS_BRANCH || "dev", // Specify your Amplify environment
    path: path.resolve(__dirname, '..', 'lib' ,'amplify-export-scratch2')
});
backend.node.children
