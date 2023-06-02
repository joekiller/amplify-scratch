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

## What is the flow
1. `amplify init` the env without `--forcePush`. 
    
    - This command has Amplify create bucket and auth role names that help the CLI add categories of features to. 
2. `amplify export --out cdk/lib --yes`
    - This is nearly the same as Amplify push and in fact, anything that isn't the same is likely a side effect/bug/migration forgotten. 

Now in the `cdk/` dir
4. `cdk deploy --require-approval never exported-amplify-backend-stack`
    - Push out the augmented stack that will create the custom CDK resources correctly.
5. `amplify export pull --rootStackName "amplify-scratch2-dev-12345" --out out --frontend javascript`
    - Update your `aws-exports.json`.

And no `amplify push` because it'll nuke the CDK custom resource stack we attach. If [amplify-cli issue #12702] is ever
fixed perhaps this flow will no longer be needed outside [pure CDK pipelining](https://aws.amazon.com/blogs/mobile/export-amplify-backends-to-cdk-and-use-with-existing-deployment-pipelines/).

## Build
The [amplify.yml](amplify.yml) should be compatible as is to deploy and work with CDK deployed backends
that work the same way you would expect from an amplify build otherwise. Because the CLI
is used the init the environment the CDK stack doesn't register the backend with an amplify
environment however if the deployment is out of band of the build, then providing the amplify
app id will enable the backend to show up in the console.

## Headless Setup
You may need to adjust the `amplify init` in the build to include [headless Amplify init --categories] .

### missing auth headless params
If you get an error such as the following you need to include the auth categories headless params.
>Could not initialize categories for '<envName>': auth headless is missing the following inputParams userPoolId, webClientId, nativeClientId

_"Where did they go?"_

Typically the data is provided from adding a new environment and the cli copies the values, [amplify auth import],
or perhaps the build has [amplifyPush --simple] and Amplify is secretly replacing the string with the appropriate
configuration and otherwise you don't know it. Who knows. Let's see how to resolve it...

Example adjustment to backend build commands:
```yaml
 - |
   read -r -d 'END' AUTHCONFIG << EOM
   {
      "userPoolId":"${AMPLIFY_USERPOOL_ID:-<yourPool>}",
      "webClientId":"${AMPLIFY_WEBCLIENT_ID:-<yourWebClient>}",
      "nativeClientId":"${AMPLIFY_NATIVECLIENT_ID:-<yourNativeId>}"
   }END
   EOM
   read -r -d 'END' CATEGORIES << EOM
   {
     "auth":${AUTHCONFIG}
   }END
   EOM
   export CATEGORIES
  - amplify init ... --categories "${CATEGORIES}" ...;
```

If you have an identity pool as well include the following in the json structure.
```yaml
      "identityPoolId":"${AMPLIFY_IDENTITYPOOL_ID:-<yourIdentityPoolId>}"
```

To find the values, you can copy them from another team-provider.json, check to see
if the [amplify auth build variables] are set.
 
If it's really bad, you can unlink and relink following the [amplify auth import] instructions.

You can also view this thread on [amplify-hosting issue #1271] where people express their confusion,
dissatisfaction, resolutions, workarounds, and otherwise relevant feelings towards this subject.

## Frontend 

## Working Around Nuance
There are a number of bugs in Amplify CLI deployment that need to be worked around or nuances
that this is working around:
 * [amplifyPush --simple].

[amplifyPush --simple]: https://github.com/aws-amplify/amplify-hosting/pull/3493?notification_referrer_id=NT_kwDOAA-bx7I2NTU4NzQxNTAzOjEwMjI5MTk#issuecomment-1563464012
[headless Amplify init --categories]: https://docs.amplify.aws/cli/usage/headless/#--categories
[amplify auth build variables]: https://docs.amplify.aws/cli/auth/import/#add-environmental-variables-to-amplify-console-build
[amplify auth import]: https://docs.amplify.aws/cli/auth/import/
[amplify-hosting issue #1271]:https://github.com/aws-amplify/amplify-hosting/issues/1271
[amplify-cli issue #12702]:https://github.com/aws-amplify/amplify-cli/issues/12702
