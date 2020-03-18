#!/usr/bin/env node

const fs = require('fs');
const yargs = require('yargs');
const iotworker = require('./iotworker');
const configer = require('./configer');

yargs
  .scriptName("iotcognito")
  .usage('$0 <cmd> [args]')
  .command('signup', '',
    (yargs) => {
      yargs.option('key', {
        type: 'string',
        alias: 'k',
        default: 'default',
        describe: 'the key of the config'
      })
      .option('usr', {
        type: 'string',
        alias: 'u',
        describe: 'Cognito Userpool Username'
      })
      .option('pwd', {
        type: 'string',
        alias: 'p',
        describe: 'Cognito Userpool User Password'
      })
      .option('email', {
        type: 'string',
        alias: 'e',
        describe: 'Cognito Userpool User Email'
      })
    },
    (argv) => {
      const config = configer.readConfig(argv.key);

      configer.signUp({
        username: argv.usr,
        password: argv.pwd,
        email: argv.email,
      }, config); 

    }
  )
  .example('$0 signup --usr user --pwd pass --email abc@example.com --key default', '')
  .command('confirm', '',
    (yargs) => {
      yargs.option('key', {
        type: 'string',
        alias: 'k',
        default: 'default',
        describe: 'the key of the config'
      })
      .option('usr', {
        type: 'string',
        alias: 'u',
        describe: 'Cognito Userpool Username'
      })
      .option('code', {
        type: 'string',
        alias: 'c',
        describe: 'Cognito Userpool User Confirmation Code'
      })
    },
    (argv) => {
      const config = configer.readConfig(argv.key);

      configer.confirmSignUp({
        username: argv.usr,
        code: argv.code,
      }, config); 

    }
  )
  .example('$0 confirm --usr user --code 123456 --key default', '')
  .command('iotwork', '',
    (yargs) => {
      yargs.option('key', {
        type: 'string',
        alias: 'k',
        default: 'default',
        describe: 'the key of the config'
      })
      .option('usr', {
        type: 'string',
        alias: 'u',
        describe: 'Cognito Userpool Username'
      })
      .option('pwd', {
        type: 'string',
        alias: 'p',
        describe: 'Cognito Userpool User Password'
      })
    },
    (argv) => {
      const config = configer.readConfig(argv.key);

      if (argv.usr && argv.pwd) {
        iotworker.iotwork({
          username: argv.usr,
          password: argv.pwd
        }, config);        
      } else {
        iotworker.iotwork({
          username: config.usr,
          password: config.pwd
        }, config); 
      }
    }
  )
  .example('$0 iotwork --usr user --pwd pass', '')
  .example('$0 iotwork --key default', '')
  .command(
    'config',
    '',
    (yargs) => {
      yargs.option('set', {
        type: 'string',
        alias: 's',
        describe: 'the config json'
      })
      .option('key', {
        type: 'string',
        alias: 'k',
        default: 'default',
        describe: 'the key of the config'
      })
      .option('usr', {
        type: 'string',
        alias: 'u',
        describe: 'Cognito Userpool Username'
      })
      .option('pwd', {
        type: 'string',
        alias: 'p',
        describe: 'Cognito Userpool User Password'
      })
    },
    (argv) => {
      console.log('config', argv);
      configer.saveConfig(argv);
    }
  )
  .example('$0 config --set aws-exports.json', '')
  .example('$0 config --set aws-exports.json --key default --usr user --pwd pass', '')
  .config('set', 'configuration', function (configPath) {
    const configJson = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return configJson;
  })
  .version()
  .help()
  .argv;