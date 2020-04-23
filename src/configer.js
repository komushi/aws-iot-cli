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

const readAllConfig = () => {
	let jsonConfig;

	if (fs.existsSync(configFile)) {
		jsonConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
	} else {
		jsonConfig = {};
	}

	return jsonConfig;
}


