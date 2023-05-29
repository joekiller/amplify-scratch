import {Construct} from "constructs";
import {AmplifyExportedBackend, AmplifyExportedBackendProps} from "@aws-amplify/cdk-exported-backend";
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from "aws-cdk-lib/custom-resources";
import {CfnParameter} from "aws-cdk-lib";
import {IBucket} from "aws-cdk-lib/aws-s3";
import {IRole} from "aws-cdk-lib/aws-iam";

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
            const cfnInclude = this.rootStack.node.findChild('AmplifyCfnInclude');
            const deploymentBucket = cfnInclude.node.findChild('DeploymentBucket') as IBucket;
            const authRole = cfnInclude.node.findChild('AuthRole') as IRole;
            const unauthRole = cfnInclude.node.findChild('UnauthRole') as IRole;
            new AwsCustomResource(this.rootStack, 'CreateBackendEnvironment', {
                onCreate: {
                    service: 'Amplify',
                    action: 'createBackendEnvironment',
                    parameters: {
                        appId: this.appId,
                        environmentName: this.env,
                        stackName: this.rootStack.stackName,
                        deploymentArtifacts: deploymentBucket.bucketName,
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
            new CfnParameter(this.rootStack, 'AuthRoleName', {
                type: 'String',
                default: authRole.roleName
            });
            new CfnParameter(this.rootStack, 'DeploymentBucketName', {
                type: 'String',
                default: deploymentBucket.bucketName
            });
            new CfnParameter(this.rootStack, 'UnauthRoleName', {
                type: 'String',
                default: unauthRole.roleName
            });
        }
    }
}