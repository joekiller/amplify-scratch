import * as cdk from 'aws-cdk-lib';
import {AugmentedAmplifyExportedBackend} from "../lib/AugmentedAmplifyExportedBackend";
import {EXPORT_PATH} from "../lib/util";
import {Match, Template} from "aws-cdk-lib/assertions";

test('Backend Created', () => {
  const appId = 'testAppId';
  const env = "testenv"; // Specify your Amplify environment (all lowercase!!)
  const app = new cdk.App();
  const backend = new AugmentedAmplifyExportedBackend(app, "testExport", {
    amplifyEnvironment: env,
    amplifyAppId: appId,
    path: EXPORT_PATH
  });
  const template = Template.fromStack(backend.cfnInclude.stack);

  template.hasResource('Custom::AWS', {
    Properties: {
      Create: Match.stringLikeRegexp(`.*Amplify.*createBackendEnvironment.*appId.*${appId}.*environmentName.*${env}.*`),
      Delete: Match.stringLikeRegexp(`.*Amplify.*deleteBackendEnvironment.*appId.*${appId}.*environmentName.*${env}.*`),
    }
  });
});
