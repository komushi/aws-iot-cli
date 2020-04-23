const AWS = require('aws-sdk');
const Amplify = require('@aws-amplify/core');
const Auth = require('@aws-amplify/Auth');

global.fetch = require('node-fetch');

module.exports.signUp = async ({username, password, email}, config) => {
	Amplify.default.configure(config);

	const rtn = await Amplify.default.Auth.signUp({
		username: username,
		password: password,
	    attributes: {
	        email: email
	    },
	})
	.then(data => console.log(data))
	.catch(err => console.log(err));
}

module.exports.confirmSignUp = async ({username, code}, config) => {
	Amplify.default.configure(config);

	Amplify.default.Auth.confirmSignUp(username, code, {
	    forceAliasCreation: true    
	})
	.then(data => console.log(data))
	.catch(err => console.log(err));
}


module.exports.signIn = async ({username, password}, config) => {
	Amplify.default.configure(config);

	await Amplify.default.Auth.signIn(username, password);

	const [ currentUserInfo, currentUserCredentials] = await Promise.all([
		Amplify.default.Auth.currentUserInfo(),
		Amplify.default.Auth.currentUserCredentials()
	]);

	const authResult = {
		username: currentUserInfo.username,
		identityId: currentUserCredentials.identityId,
		identityPoolId: currentUserCredentials.params.IdentityPoolId
	};

	console.log('authResult - group admins need to accept users with this info', authResult);	

	AWS.config = new AWS.Config({
	  credentials: currentUserCredentials, region: config.aws_project_region
	});

	return currentUserCredentials;
}