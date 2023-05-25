const fs = require('fs');
const parameters = JSON.parse(fs.readFileSync(0, { encoding: 'utf8' }));

// Get the running Amplify CLI major version number
const currentCLIMajorVersion = parameters.data.amplify.version.split('.')[0]
console.log('Amplify CLI major version: ', currentCLIMajorVersion)

const MINIMUM_MAJOR_AMPLIFY_CLI_VERSION = 5
console.log('Minimum required Amplify CLI major version: ', MINIMUM_MAJOR_AMPLIFY_CLI_VERSION)

if (currentCLIMajorVersion < MINIMUM_MAJOR_AMPLIFY_CLI_VERSION) {
    // Non-zero exit code will stop the Amplify CLI command's execution
    console.log('Minimum CLI version requirement not met.')
    process.exit(1)
} else {
    console.log('Minimum CLI version requirement met.')
}

// Read parameters and get env name
let envName;
if(parameters.data.amplify.environment == null) {
    console.log('parameters.data.amplify.environment is undefined');
} else if (parameters.data.amplify.environment.envName == null) {
    console.log('parameters.data.amplify.environment.envName is undefined');
} else {
    envName = parameters.data.amplify.environment.envName;
}
if(envName == null) {
    console.log('in new env path, no env detected');
    if (parameters.data.amplify.argv == null) {
        console.log('parameters.data.amplify.argv is undefined');
        process.exit(1);
    }
    const amplifyArgIdx = parameters.data.amplify.argv.findIndex(a => a.localeCompare('--amplify') === 0);
    if (amplifyArgIdx === -1) {
        console.log('parameters.data.amplify.argv is missing amplify');
        process.exit(1);
    }
    const amplifyParams = JSON.parse(parameters.data.amplify.argv[amplifyArgIdx + 1]);
    console.log(amplifyParams);
    if (amplifyParams.envName == null) {
        console.log('envName not part of amplify argv');
        process.exit(1);
    }
    envName = amplifyParams.envName;
    console.log('got envName: ' + envName);
    // I've found my envName even though the first push hasn't happened.
    // With this information I still cannot reasonably determine at this
    // point what the stackName will be due to the random suffix appended:
    // https://github.com/aws-amplify/amplify-cli/blob/v12.0.0/packages/amplify-provider-awscloudformation/src/initializer.ts#L60-L62C51

}
if(envName == null) {
    console.log('never found envName');
} else {
    console.log('I got all env info and now I\'d like to setup a third party dependency that wants my stackName');
    // this should happen for the very first push and any subsequent.
    // on the very first push though I cannot determine the stackName, and thus I am blocked.
    // filing https://github.com/aws-amplify/amplify-cli/issues/12640
}
