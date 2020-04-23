const AWS = require('aws-sdk');
const Amplify = require('@aws-amplify/core');
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
    } catch (e) {
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

module.exports.pub = async ({room, msg}, currentUserCredentials) => {
	initiatePubsub(currentUserCredentials.identityId);

	return await publish(currentUserCredentials.params.IdentityPoolId, currentUserCredentials.identityId, room, msg);	
}

module.exports.sub = (currentUserCredentials) => {
	initiatePubsub(currentUserCredentials.identityId);

    try {
		Amplify.default.PubSub.subscribe(`${currentUserCredentials.params.IdentityPoolId}/#`).subscribe({
		    next: data => console.log('Message received', data.value),
		    error: error => console.error('subscribe error', error),
		    close: () => console.log('Done'),
		});
    } catch (e) {
        return e;
    }

}