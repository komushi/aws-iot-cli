const Amplify = require('aws-amplify');
const AWS = require('aws-sdk');
const Auth = Amplify.Auth;
const PubSub = Amplify.PubSub;
const { AWSIoTProvider } = require('@aws-amplify/pubsub/lib/Providers');

// Amplify.default.addPluggable(new AWSIoTProvider());

global.fetch = require('node-fetch');
global.navigator = {};
global.WebSocket = require('ws');

const publish = async(identityPoolId, msg) => {
    try {
        return await PubSub.publish(identityPoolId + '/room1', { msg });
        // await PubSub.publish('ap-northeast-1:76d6f549-28eb-498d-a516-04294235d82c' + '/room1', { msg });
    } catch (e) {
        // console.error('publish', e);
        return e;
    }
}

/*
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
*/

const initiateCognitoAuth = async(username, password, region) => {

	await Auth.signIn(username, password);

	const [ currentUserInfo, currentUserCredentials] = await Promise.all([
		Auth.currentUserInfo(),
		Auth.currentUserCredentials()
	]);
	
	// console.log('currentUserCredentials.IdentityPoolId', currentUserCredentials.params.IdentityPoolId);
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
		identityId: currentUserCredentials.identityId,
		identityPoolId: currentUserCredentials.params.IdentityPoolId
	};

}


module.exports.pub = async ({username, password, msg}, config) => {
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
	
	const iotProvider = new AWSIoTProvider({
		clientId: authResult.identityId
		// clientId: 'ap-northeast-1:76d6f549-28eb-498d-a516-04294235d82c'
	});
	Amplify.default.addPluggable(iotProvider);

	return await publish(authResult.identityPoolId, msg);
}

module.exports.sub = async ({username, password}, config) => {
	Amplify.default.configure(config);

	const authResult = await initiateCognitoAuth(username, password, config.aws_cognito_region).catch(e => {
		console.error('Authentication Failure!');
		console.error(e);
		return;
	});

	if (!authResult) {
		return;
	}
	
	const iotProvider = new AWSIoTProvider({
		clientId: authResult.identityId
	});
	Amplify.default.addPluggable(iotProvider);

/*
	PubSub.subscribe(authResult.identityPoolId + '/room1').subscribe({
	    next: data => console.log('Message received', data),
	    error: error => console.error('subscribe error', error),
	    close: () => console.log('Done'),
	});
*/

    try {
    	console.log('authResult.identityPoolId', authResult.identityPoolId)
		PubSub.subscribe(authResult.identityPoolId + '/room1').subscribe({
		    next: data => console.log('Message received', data.value),
		    error: error => console.error('subscribe error', error),
		    close: () => console.log('Done'),
		});
    } catch (e) {
        // console.error('publish', e);
        return e;
    }

}