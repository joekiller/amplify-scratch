import {NestedStack, Stack, StackProps} from "aws-cdk-lib";
import {AugmentedAmplifyExportedBackend} from "../../AugmentedAmplifyExportedBackend";
import {Construct} from "constructs";
import {GraphqlApi} from "aws-cdk-lib/aws-appsync";

/**
 * use this cdk-stack while https://github.com/aws-amplify/amplify-cli/issues/12702 exists
 *
 * @example
 * // Previously
 * const dependencies: AmplifyDependentResourcesAttributes = AmplifyHelpers.addResourceDependency(
 *     this,
 *     amplifyResourceProps.category,
 *     amplifyResourceProps.resourceName,
 *     [{
 *         category: "api", // api, auth, storage, function, etc.
 *         resourceName: "scratch2" // find the resource at "amplify/backend/<category>/<resourceName>"
 *     }]
 * );
 *
 * // AppSync GraphQL API
 * const graphqlApi = GraphqlApi.fromGraphqlApiAttributes(this, 'gr', {
 *     graphqlApiId: Fn.ref(dependencies.api.scratch2.GraphQLAPIIdOutput)
 * });
 *
 * @example
 * // Now
 * const dependencies = props.amplifyResources;
 *
 * // AppSync GraphQL API
 * const graphqlApi = GraphqlApi.fromGraphqlApiAttributes(this, 'gr', {
 *     graphqlApiId: dependencies.graphqlNestedStacks().graphQLAPI().attrApiId
 * });
 */
export class cdkStack extends NestedStack {
    constructor(scope: Construct, id: string, props: StackProps & {amplifyResources: AugmentedAmplifyExportedBackend}) {
        super(scope, id, props);

        const dependencies = props.amplifyResources;
        // AppSync GraphQL API
        const graphqlApi = GraphqlApi.fromGraphqlApiAttributes(this, 'gr', {
            graphqlApiId: dependencies.graphqlNestedStacks().graphQLAPI().attrApiId
        });
    }
}
