const username = 'xulei';
const password = 'pa55word';
const filePath = '/screenshot.png';

// require('isomorphic-fetch');
const aws_exports = require('./aws-exports').getConfig();
const Amplify = require('aws-amplify');
const AWS = require('aws-sdk');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');
const zlib = require('zlib');


global.fetch = require('node-fetch');
global.navigator = {};


Amplify.default.configure(aws_exports);
Amplify.Storage.configure({ level: 'protected' });


// Amplify.default.configure({
//     Auth: {
//         identityPoolId: aws_exports.aws_cognito_identity_pool_id,
//         region: aws_exports.aws_cognito_region,
//         userPoolId: aws_exports.aws_user_pools_id,
//         userPoolWebClientId: aws_exports.aws_user_pools_web_client_id,
//     },
// 	aws_appsync_graphqlEndpoint: aws_exports.aws_appsync_graphqlEndpoint,
// 	aws_appsync_region: aws_exports.aws_appsync_region,
// 	aws_appsync_authenticationType: aws_exports.aws_appsync_authenticationType,
// 	aws_appsync_apiKey: aws_exports.aws_appsync_apiKey,
//     Storage: {
//         AWSS3: {
//             bucket: aws_exports.aws_user_files_s3_bucket,
//             region: aws_exports.aws_user_files_s3_bucket_region
//         }
//     }
// });

// Amplify.Storage.configure({ level: 'protected' });



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

const checkCredentials = async () => {
	return new Promise((resolve, reject) => {
	    AWS.config.credentials.get(() => {
	    	const result = {
	    		accessKeyId: AWS.config.credentials.accessKeyId,
	    		secretAccessKey: AWS.config.credentials.secretAccessKey,
	    		sessionToken: AWS.config.credentials.sessionToken
	    	};

	    	console.log(result)

	    	resolve(result);
	    });
	});
}

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
	  // currentAuthenticatedUser,
	  currentUserInfo,
	  currentUserCredentials,
	] = 
	  await Promise.all([
	    // Auth.currentAuthenticatedUser(), 
	    Auth.currentUserInfo(),
	    Auth.currentUserCredentials()
	  ]);

	// console.log('currentAuthenticatedUser', JSON.stringify(currentAuthenticatedUser));
	// console.log('currentUserCredentials', JSON.stringify(currentUserCredentials));
	
	console.log('***** Begin currentUserInfo *****');
	console.log(JSON.stringify(currentUserInfo));
	console.log('***** End currentUserInfo *****');

	AWS.config = new AWS.Config({
	  credentials: currentUserCredentials, region: aws_exports.aws_cognito_region
	});


	return {currentUserInfo, currentUserCredentials};

}

const multiUpload = async({currentUserInfo, currentUserCredentials}) => {

	const graphqlOperation = Amplify.graphqlOperation;
	const uid = new ShortUniqueId();

	const fileKey = uid.randomUUID(6);
	// const objKey = `protected/${currentUserInfo.attributes['custom:identity_id']}/${fileKey}`;
	const objKey = `protected/${currentUserInfo.attributes['profile']}/${fileKey}`;
	const bucket = aws_exports.aws_user_files_s3_bucket;

	// const fileStream = fs.createReadStream(__dirname + filePath).pipe(zlib.createGzip());
    const fileStream = fs.createReadStream(__dirname + filePath);
   

	const params = {Bucket: bucket, Key: objKey, Body: fileStream};
	const options = {partSize: 10 * 1024 * 1024, queueSize: 1};

	const s3 = new AWS.S3({apiVersion: '2006-03-01'});
	const s3upload = s3.upload(params, options);

	s3upload.on('httpUploadProgress', evt => { console.log('httpUploadProgress', evt) });

	return new Promise((resolve, reject) => {
			s3upload.send((err, data) => {
				if (err) {
					console.log("An error occurred", err);
					reject(err);
				} else {
					console.log("Uploaded the file at", data.Location);		
					resolve({ objKey, fileKey, fileName: filePath, user: currentUserInfo.username });
				}
			});
	    });


	// const response = await s3.upload(params, options, (err, data) => {
	// 	if (err) {
	// 		console.log("An error occurred", err);
	// 	} else {
	// 		console.log("Uploaded the file at", data.Location);		
	// 	}
	// }).promise();
	// console.log('response', response);
	// return { objKey, fileKey, fileName: filePath, user: currentUserInfo.username };

	// return new Promise((resolve, reject) => {
	// 		s3.upload(params, options, (err, data) => {
	// 			if (err) {
	// 				console.log("An error occurred", err);
	// 				reject(err);
	// 			} else {
	// 				console.log("Uploaded the file at", data.Location);		
	// 				resolve({ objKey, fileKey, fileName: filePath, user: currentUserInfo.username });
	// 			}
	// 		});
	//     });
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
	.then(multiUpload)
	.then(saveUploadJob)
	.catch(e => console.error(e));

