const Amplify = require('@aws-amplify/core');
const Auth = require('@aws-amplify/Auth');

global.fetch = require('node-fetch');

const fs = require('fs');
const os = require('os');
const path = require('path');

const filename = '.cognitorc';
const configFile = path.join(os.homedir(), filename);

module.exports.readConfig = (key) => {
	const jsonConfig = readAllConfig();

	return jsonConfig[key];
}

module.exports.saveConfig = (argv) => {

	const settings = {
		usr: argv.usr,
		pwd: argv.pwd,		
		aws_user_pools_web_client_id: argv.aws_user_pools_web_client_id,
		aws_user_pools_id: argv.aws_user_pools_id,
		aws_cognito_region: argv.aws_cognito_region,
		aws_cognito_identity_pool_id: argv.aws_cognito_identity_pool_id,
		aws_pubsub_endpoint: argv.aws_pubsub_endpoint,
		aws_pubsub_region: argv.aws_pubsub_region,
		aws_project_region: argv.aws_project_region
	};

	let jsonConfig = readAllConfig();

	jsonConfig[argv.key] = settings;

	const output = JSON.stringify(jsonConfig);

	// console.log('output', output);

	fs.writeFileSync(configFile, output);	
}

readAllConfig = () => {
	let jsonConfig;

	if (fs.existsSync(configFile)) {
		jsonConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	} else {
		jsonConfig = {};
	}

	return jsonConfig;
}

module.exports.signUp = async ({username, password, email}, config) => {
	configureAmplify(config);

	const authResult = await signUp(
		username, 
		password,
		email
	).catch(e => {
		console.error('SignUp Failure!');
		console.error(e);
	});
}

module.exports.confirmSignUp = async ({username, code}, config) => {
	configureAmplify(config);

	Amplify.default.Auth.confirmSignUp(username, code, {
	    forceAliasCreation: true    
	})
	.then(data => console.log(data))
	.catch(err => console.log(err));
}

const configureAmplify = (config) => {
	Amplify.default.configure(config);
}

const signUp = async(username, password, email) => {
  	console.log('username', username)
  	console.log('password', password)	

	const rtn = await Amplify.default.Auth.signUp({
		username: username,
		password: password,
	    attributes: {
	        email: email
	    },
	});
}


