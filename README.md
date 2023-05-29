# The not really eject from amplify push cdk workflow
There are several outstanding bugs in deploying CDK custom resources from amplify itself
however they have provided a nice export of the infrastructure into CDK. The translation
results in a CDK stack that is internally equivalent to the amplify backend stack however
the template itself is different than what an Amplify CLI cloudformation would create.

I made the AugmentedAmplifyExportedBackend to bridge building `cdk-stack.ts` while working
around bugs that the Amplify CDK compiler still has yet to tackle. The Augmented backend
adds the correct CfnParams that the CLI would want so once you init an environment the CLI
can interact, checkout, and develop against the environment. Just never push directly and
instead use the export workflow.

## Build
The [amplify.yml](amplify.yml) should be compatible as is to deploy and work with CDK deployed backends
that work the same way you would expect from an amplify build otherwise. Because the CLI
is used the init the environment the CDK stack doesn't register the backend with an amplify
environment however if the deployment is out of band of the build, then providing the amplify
app id will enable the backend to show up in the console.

## Working Around Nuance
There are a number of bugs in Amplify CLI deployment that need to be worked around or nuances
that this is working around:
 * [amplifyPush --simple].

[amlpifyPush --simple]: https://github.com/aws-amplify/amplify-hosting/pull/3493?notification_referrer_id=NT_kwDOAA-bx7I2NTU4NzQxNTAzOjEwMjI5MTk#issuecomment-1563464012
