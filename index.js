const username = 'xu';
const password = 'pa55word';
const filePath = '/screenshot.png';

// require('isomorphic-fetch');
const aws_exports = require('./aws-exports').getConfig();
const Amplify = require('aws-amplify');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const filetype = require('file-type');
const axios = require('axios');

global.fetch = require('node-fetch');
global.navigator = {};


Amplify.default.configure(aws_exports);
Amplify.Storage.configure({ level: 'protected' });

/*
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
*/


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

const getPutObjectSignedUrl = `query GetPutObjectSignedUrl($input: GetPutObjectSignedUrl!) {
  getPutObjectSignedUrl(input: $input) {
    url
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
	
	console.log('***** Begin currentUserInfo *****');
	console.log(JSON.stringify(currentUserInfo));
	console.log('***** End currentUserInfo *****');

	return currentUserInfo;

}

const uploadWithSignedUrl = async(currentUserInfo) => {

	const API = Amplify.API;
	const graphqlOperation = Amplify.graphqlOperation;
	const uid = new ShortUniqueId();

	const fileKey = uid.randomUUID(6);
	const objKey = `protected/${currentUserInfo.attributes['custom:identity_id']}/${fileKey}`;
	const bucket = aws_exports.aws_user_files_s3_bucket;

    const fileContents = fs.readFileSync(__dirname + filePath);
    const contentType = filetype(fileContents).mime;

    console.log('***** Begin contentType *****');
    console.log(contentType);
    console.log('***** End contentType *****');

	const input = {
	    bucket,
	    objKey,
	    contentType
	};

    const presignedUrlRtn = await API.graphql(graphqlOperation(getPutObjectSignedUrl, { input }))
      .catch(e => {
        throw e;
      });

  	console.log('***** Begin presignedUrl *****');
    console.log(presignedUrlRtn.data.getPutObjectSignedUrl.url);
    console.log('***** End presignedUrl *****');

	const axiosRtn = await axios.put(
		presignedUrlRtn.data.getPutObjectSignedUrl.url,
		fileContents,
		{ headers: { 'Content-Type': contentType } }
	)
  	
  	return { objKey, fileKey, fileName: filePath, user: currentUserInfo.username };
}

const saveUploadJob = async ({objKey, fileKey, fileName, user}) => {

	const API = Amplify.API;
	const graphqlOperation = Amplify.graphqlOperation;

	const input = {
	    user,
	    objKey,
	    fileKey,
	    fileName,
	    status: 'Done',
	    uploadedOn: new Date().toISOString()
	};

    const rtn = await API.graphql(graphqlOperation(createUploadJob, { input }))
      .catch(e => {
        // console.error('createUploadJob', e);
        throw e;
      });

  	// console.log('saveUploadJob rtn', rtn);
  	console.log('***** Begin createUploadJob *****');
    console.log(rtn);
    console.log('***** End createUploadJob *****');

  	return { fileKey, data: rtn };
}

proceedAuth()
	.then(loadAuthenticationInfo)
	.then(uploadWithSignedUrl)
	.then(saveUploadJob)
	.catch(e => console.error(e));

