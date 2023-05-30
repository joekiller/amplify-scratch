import {NestedStack, Stack, StackProps} from "aws-cdk-lib";
import {AugmentedAmplifyExportedBackend} from "../../AugmentedAmplifyExportedBackend";
import {Construct} from "constructs";
import {GraphqlApi} from "aws-cdk-lib/aws-appsync";

/**
 * Use this cdk-stack while https://github.com/aws-amplify/amplify-cli/issues/12702 exists
 *
 *
 * Previously you hooked up the dependencies via the AmplifyDependentResourcesAttributes
 *
 * @example
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
 * Now we the stack will pass the {@link AugmentedAmplifyExportedBackend} to the stack
 * and you can do whatever you need in the cdk-stack similarly to what Amplify custom cdk
 * stack may provide once some bugs are fixed.
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
    constructor(scope: Construct, id: string, props: StackProps & {amplifyResources: AugmentedAmplifyExportedBackend, env: string}) {
        super(scope, id, props);

        const dependencies = props.amplifyResources;
        // AppSync GraphQL API
        const graphqlApi = GraphqlApi.fromGraphqlApiAttributes(this, 'gr', {
            graphqlApiId: dependencies.graphqlNestedStacks().graphQLAPI().attrApiId
        });
    }
}
