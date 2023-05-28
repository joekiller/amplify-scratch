Create the example [cdk-stack.ts](amplify/backend/custom/stubby/cdk-stack.ts) to create
a race condition with the Lambda role and policies that allow it to publish the SNS stack.

Typically, the CDK stack will resolve the permissions however if Amplify generates the 
stacks, the lambda is marked as depending on the policies which it needs to have created
prior to adding the event source.

With Amplify alone, it's a race to see if the permissions will apply before the lambda is created
with the event source however typically it'll fail with:

> Resource handler returned message: "Invalid request provided: The provided execution role does not have permissions to call Publish on SNS (Service: Lambda, Status Code: 400, Request ID: abc123)" (RequestToken: abc123, HandlerErrorCode: InvalidRequest)

The [amplify.yml](amplify.yml) includes a build that'll diff the two items.

