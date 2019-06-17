// require('isomorphic-fetch');
const aws_exports = require('./aws-exports').getConfig();
const Amplify = require('aws-amplify');
const ShortUniqueId = require('short-unique-id');

// Amplify.default.configure(aws_exports);
// Amplify.Storage.configure({ level: 'protected' });

global.fetch = require('node-fetch');
global.navigator = {};
// global.navigator.userAgent = global.navigator.userAgent || 'all';


// Amplify.default.configure(aws_exports);
// Amplify.Storage.configure({ level: 'protected' });

Amplify.default.configure({
    Auth: {
        identityPoolId: aws_exports.aws_cognito_identity_pool_id,
        region: aws_exports.aws_cognito_region,
        userPoolId: aws_exports.aws_user_pools_id,
        userPoolWebClientId: aws_exports.aws_user_pools_web_client_id,
    },
	aws_appsync_graphqlEndpoint: aws_exports.aws_appsync_graphqlEndpoint,
	aws_appsync_region: aws_exports.aws_appsync_region,
	aws_appsync_authenticationType: aws_exports.aws_appsync_authenticationType,
	aws_appsync_apiKey: aws_exports.aws_appsync_apiKey,
    Storage: {
        AWSS3: {
            bucket: aws_exports.aws_user_files_s3_bucket,
            region: aws_exports.aws_user_files_s3_bucket_region
        }
    }
});

Amplify.Storage.configure({ level: 'protected' });


const username = 'xu';
const password = 'pa55word';

const createUploadJob = `mutation CreateUploadJob($input: CreateUploadJob!) {
  createUploadJob(input: $input) {
    user
    objKey
    fileKey
    fileName
    status
    uploadedOn
  }
}
`;

const proceedAuth = async () => {
	const Auth = Amplify.Auth;
	const rtn = await Auth.signIn(username, password).catch((err) => {
	  // console.log(err);
	  throw err;
	});

	// console.log('proceedAuth rtn', rtn);
	return rtn;
}

const loadAuthenticationInfo = async() => {

	const Auth = Amplify.Auth;

	const [
	  currentAuthenticatedUser, 
	  currentUserInfo, 
	] = 
	  await Promise.all([
	    Auth.currentAuthenticatedUser(), 
	    Auth.currentUserInfo(),
	  ]);

	// console.log('currentAuthenticatedUser', JSON.stringify(currentAuthenticatedUser));
	console.log('currentUserInfo', JSON.stringify(currentUserInfo));

	return currentUserInfo

}

const invokeAppsync = async (currentUserInfo) => {

	const API = Amplify.API;
	const graphqlOperation = Amplify.graphqlOperation;
	const uid = new ShortUniqueId();

	const fileKey = uid.randomUUID(6)

	const input = {
	    user: currentUserInfo.username,
	    objKey: `protected/${currentUserInfo.attributes['custom:identity_id']}/${fileKey}`,
	    fileKey: fileKey,
	    fileName: 'original.file',
	    status: 'Done',
	    uploadedOn: new Date().toISOString()
	};

	// console.log('input', input);

    const rtn = await API.graphql(graphqlOperation(createUploadJob, { input }))
      .catch(e => {
        // console.error('createUploadJob', e);
        throw e;
      });

  	console.log('proceedAppsync rtn', rtn);
  	return { fileKey, data: rtn };
}

const saveFile = async ({fileKey, data}, fileContentType = "binary/octet-stream", s3level = "protected") => {

    await Amplify.Storage.put(
    	fileKey, 
    	JSON.stringify(data), { 
    		level: s3level,
			contentType: 'application/json'
		}).catch(e => {
      console.log("storage.put", e);
      throw e;
    });

}

proceedAuth()
	.then(loadAuthenticationInfo)
	.then(invokeAppsync)
	// .then(saveFile)
	.catch(e => console.error(e));

