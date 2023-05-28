#!/usr/bin/env node
import 'source-map-support/register';
import {App} from 'aws-cdk-lib';
import {cdkStack} from '../../amplify/backend/custom/stubby/cdk-stack';
const app = new App();
new cdkStack(app, 'CdkStack');
