const username = 'xulei';
const password = 'pa55word';
const filePath = '/iot.mp4';

// require('isomorphic-fetch');
const aws_exports = require('./aws-exports').getConfig();
const Amplify = require('aws-amplify');
const AWS = require('aws-sdk');
const ShortUniqueId = require('short-unique-id');
const fs = require('fs');

global.fetch = require('node-fetch');
global.navigator = {};


Amplify.default.configure(aws_exports);
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


const initiateCognitoAuth = async() => {

	const Auth = Amplify.Auth;

	await Auth.signIn(username, password).catch((err) => {
	  // console.log(err);
	  throw err;
	});

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

	// console.log('identity_id', currentUserCredentials.params.IdentityId);
	// console.log('identity_id', currentUserCredentials.data.IdentityId);
	// console.log('identity_id', currentUserCredentials._identityId);
	console.log('identity_id', currentUserCredentials.identityId);
	
	console.log('***** Begin currentUserInfo *****');
	console.log(JSON.stringify(currentUserInfo));
	console.log('***** End currentUserInfo *****');

	AWS.config = new AWS.Config({
	  credentials: currentUserCredentials, region: aws_exports.aws_cognito_region
	});


	return {username: currentUserInfo.username, identityId: currentUserCredentials.identityId};

}

const multiUpload = async({username, identityId}) => {

	const graphqlOperation = Amplify.graphqlOperation;
	const uid = new ShortUniqueId();

	const fileKey = uid.randomUUID(6);
	const objKey = `protected/${identityId}/${fileKey}`;
	const bucket = aws_exports.aws_user_files_s3_bucket;

    const fileStream = fs.createReadStream(__dirname + filePath);
   

	const params = {Bucket: bucket, Key: objKey, Body: fileStream};
	const options = {partSize: 10 * 1024 * 1024, queueSize: 10};

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
					resolve({ objKey, fileKey, fileName: filePath, user: username });
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

initiateCognitoAuth()
	.then(multiUpload)
	.then(saveUploadJob)
	.catch(e => console.error(e));

