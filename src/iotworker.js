const Amplify = require('@aws-amplify/core');
const AWS = require('aws-sdk');
const Auth = require('@aws-amplify/Auth');
const PubSub = require('@aws-amplify/PubSub');
const { AWSIoTProvider } = require('@aws-amplify/pubsub/lib/Providers');

const shortid = require('shortid');

global.fetch = require('node-fetch');
global.navigator = {};
global.WebSocket = require('ws');

const publish = async(identityPoolId, identityId, room, msg) => {
    try {
        return await Amplify.default.PubSub.publish(`${identityPoolId}/${room}/${identityId}`, { msg });
        // await PubSub.publish('ap-northeast-1:76d6f549-28eb-498d-a516-04294235d82c' + '/room1', { msg });
    } catch (e) {
        // console.error('publish', e);
        return e;
    }
}

const initiatePubsub = (identityId) => {
	const clientId = `${identityId}-${shortid.generate()}`;

	const iotProvider = new AWSIoTProvider({
		clientId: clientId
	});

	Amplify.default.addPluggable(iotProvider);
}

const initiateCognitoAuth = async(username, password, region) => {
	await Amplify.default.Auth.signIn(username, password);

	const [ currentUserInfo, currentUserCredentials] = await Promise.all([
		Amplify.default.Auth.currentUserInfo(),
		Amplify.default.Auth.currentUserCredentials()
	]);
	

	AWS.config = new AWS.Config({
	  credentials: currentUserCredentials, region: region
	});

	const result = {
		username: currentUserInfo.username,
		identityId: currentUserCredentials.identityId,
		identityPoolId: currentUserCredentials.params.IdentityPoolId
	};

	console.log('authResult - group admins need to accept users with this info', result);

	return result;

}


module.exports.pub = async ({username, password, room, msg}, config) => {
	Amplify.default.configure(config);

	const authResult = await initiateCognitoAuth(username, password, config.aws_cognito_region).catch(e => {
		console.error('Authentication Failure!');
		console.error(e);
		return;
	});

	if (!authResult) {
		return;
	}

	initiatePubsub(authResult.identityId);

	return await publish(authResult.identityPoolId, authResult.identityId, room, msg);
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
	
	initiatePubsub(authResult.identityId);

    try {
		Amplify.default.PubSub.subscribe(`${authResult.identityPoolId}/#`).subscribe({
		    next: data => console.log('Message received', data.value),
		    error: error => console.error('subscribe error', error),
		    close: () => console.log('Done'),
		});
    } catch (e) {
        // console.error('publish', e);
        return e;
    }

}