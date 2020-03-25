const Amplify = require('aws-amplify');
const AWS = require('aws-sdk');
const Auth = Amplify.Auth;
const PubSub = Amplify.PubSub;
const { AWSIoTProvider } = require('@aws-amplify/pubsub/lib/Providers');

// Amplify.default.addPluggable(new AWSIoTProvider());

global.fetch = require('node-fetch');
global.navigator = {};
global.WebSocket = require('ws');

let iotProvider;

const publish = async(topic) => {
	
	// Amplify.addPluggable(new AWSIoTProvider({
	// 	aws_pubsub_region: '<YOUR-IOT-REGION>',
	// 	aws_pubsub_endpoint: 'wss://xxxxxxxxxxxxx.iot.<YOUR-IOT-REGION>.amazonaws.com/mqtt',
 //   }));	

    try {
        await PubSub.publish(topic + '/group1', { msg: 'Hello to all subscribers!' });
    } catch (e) {
        console.error('publish', e);
    } finally {
        console.log('We do cleanup here');
    }

 	
}

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


const initiateCognitoAuth = async(username, password, region) => {

	await Auth.signIn(username, password);

	const [ currentUserInfo, currentUserCredentials] = await Promise.all([
		Auth.currentUserInfo(),
		Auth.currentUserCredentials()
	]);

  /* 
	console.log('identity_id', currentUserCredentials.identityId);
	console.log('***** Begin currentUserInfo *****');
	console.log(JSON.stringify(currentUserInfo));
	console.log('***** End currentUserInfo *****');
	*/

	AWS.config = new AWS.Config({
	  credentials: currentUserCredentials, region: region
	});

	return {
		username: currentUserInfo.username,
		identityId: currentUserCredentials.identityId
	};

}


module.exports.iotwork = async ({username, password}, config) => {
	Amplify.default.configure(config);

	const authResult = await initiateCognitoAuth(username, password, config.aws_cognito_region).catch(e => {
		console.error('Authentication Failure!');
		console.error(e);
		return;
	});

	// console.log(Amplify.PubSub.AWSIoTProvider);

	if (!authResult) {
		return;
	}
	
	if (!iotProvider) {
		iotProvider = new AWSIoTProvider({
			clientId: authResult.identityId
		});
		Amplify.default.addPluggable(iotProvider);
	}

	return await publish(authResult.identityId);
}