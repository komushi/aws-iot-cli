const username = 'xulei';
const password = 'pa55word';

// require('isomorphic-fetch');
const aws_exports = require('./aws-exports').getConfig();
const AWS = require('aws-sdk');

global.fetch = require('node-fetch');
global.navigator = {};

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const proceedCognitoUserPoolAuth = async () => {

    const authenticationData = {
        Username : username,
        Password : password,
    };

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const poolData = {
        UserPoolId : aws_exports.aws_user_pools_id,
        ClientId : aws_exports.aws_user_pools_web_client_id
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
        Username : username,
        Pool : userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    return new Promise((resolve, reject) => {
	    cognitoUser.authenticateUser(authenticationDetails, {
	        onSuccess: function(result)
	        {
	        	resolve(userPool.getCurrentUser());
	            // console.log('onSuccess', JSON.stringify(result));
	        },
	        onFailure: function(err)
	        {
	        	reject(err);
	            // console.log('onFailure', JSON.stringify(err));
	        }
	    });
    });
}

const getCognitoUserSession = async (cognitoUser) => {
	const LOGIN_KEY = `cognito-idp.${aws_exports.aws_project_region}.amazonaws.com/${aws_exports.aws_user_pools_id}`;

	return new Promise((resolve, reject) => {
	    cognitoUser.getSession((err, result) => {
	    	if (err) {
	    		reject (err);
	    	}

	        if (result) {
	            console.log('You are now logged in.');
	            
	            //POTENTIAL: Region needs to be set if not already set previously elsewhere.
	            AWS.config.region = aws_exports.aws_project_region;

	            // Add the User's Id Token to the Cognito credentials login map.
	            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	                IdentityPoolId: aws_exports.aws_cognito_identity_pool_id,
	                Logins: {
	                	[LOGIN_KEY]: result.getIdToken().getJwtToken()
	                }
	            });

	            resolve();
	        } else {
	        	reject('no session');
	        }
	    });
	});
}

const getCognitoIdentityId = async () => {
	return new Promise((resolve, reject) => {
	    AWS.config.credentials.refresh((error) => {
	    	// console.log('AWS.config.credentials', AWS.config.credentials)
	    	if (error) {
	    		reject (error);
	    	} else {
	    		resolve(AWS.config.credentials.identityId);
	    	}
	    });
	});
}

const extractCredentials = async () => {
	return new Promise((resolve, reject) => {
	    AWS.config.credentials.get(() => {
	    	resolve({
	    		accessKeyId: AWS.config.credentials.accessKeyId,
	    		secretAccessKey: AWS.config.credentials.secretAccessKey,
	    		sessionToken: AWS.config.credentials.sessionToken
	    	});
	    });
	});
}

proceedCognitoUserPoolAuth()
	.then(getCognitoUserSession)
	.then(getCognitoIdentityId)
	.then(extractCredentials)
	.then(console.log)
	.catch(e => console.error(e));
