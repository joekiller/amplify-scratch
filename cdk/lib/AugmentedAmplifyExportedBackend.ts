import {Construct} from "constructs";
import {AmplifyExportedBackend, AmplifyExportedBackendProps} from "@aws-amplify/cdk-exported-backend";
import {Constants} from "@aws-amplify/cdk-exported-backend/lib/constants";
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from "aws-cdk-lib/custom-resources";

export interface AugmentedAmplifyExportedBackendProps extends AmplifyExportedBackendProps {
    /**
     * The Amplify App ID to associate the backend with.
     */
    readonly amplifyAppId?: string
}

export class AugmentedAmplifyExportedBackend extends AmplifyExportedBackend {
    protected appId?: string;
    constructor(scope: Construct,
                id: string,
                props: AugmentedAmplifyExportedBackendProps,
    ) {
        super(scope, id, props);
        this.appId = props.amplifyAppId;

        // just like in amplify env add, we add the backend to the amplify application
        // and then deploy the CFN. This also ensures the amplify env only deletes when
        // the CFN is gone too.
        if(this.appId && this.env) {
            new AwsCustomResource(this.rootStack, 'CreateBackendEnvironment', {
                onCreate: {
                    service: 'Amplify',
                    action: 'createBackendEnvironment',
                    parameters: {
                        appId: this.appId,
                        environmentName: this.env,
                        stackName: this.exportBackendManifest.stackName,
                        deploymentArtifacts: this.exportBackendManifest.props.parameters![Constants.PARAMETERS_DEPLOYMENT_BUCKET_NAME],
                    },
                    physicalResourceId: PhysicalResourceId.of(`${this.appId}-${this.env}-backendEnvironment`)
                },
                onDelete: {
                    service: 'Amplify',
                    action: 'deleteBackendEnvironment',
                    parameters: {
                        appId: this.appId,
                        environmentName: this.env
                    }
                },
                policy: AwsCustomResourcePolicy.fromSdkCalls({
                    resources: AwsCustomResourcePolicy.ANY_RESOURCE,
                }),
            });
        }
    }
}