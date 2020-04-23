const fs = require('fs');
const yargs = require('yargs');
const iotworker = require('./iotworker');
const configer = require('./configer');
const authorizer = require('./authorizer');

yargs
  .scriptName("aws-iot")
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

      authorizer.signUp({
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

      authorizer.confirmSignUp({
        username: argv.usr,
        code: argv.code,
      }, config); 

    }
  )
  .example('$0 confirm --usr user --code 123456 --key default', '')
  .command('sub', '',
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
        authorizer.signIn({
          username: argv.usr,
          password: argv.pwd,
        }, config)
        .then(currentUserCredentials => {
          return iotworker.sub(currentUserCredentials)         
        })
        .catch(err => {
          console.error(err)
        })         
      } else {
        authorizer.signIn({
          username: config.usr,
          password: config.pwd,
        }, config)
        .then(currentUserCredentials => {
          return iotworker.sub(currentUserCredentials)         
        })
        .catch(err => {
          console.error(err)
        }) 
      }
    }
  )
  .example('$0 sub -u user -p pass -k default', '')
  .example('$0 sub -k default', '')
  .command('pub', '',
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
      .option('room', {
        type: 'string',
        alias: 'r',
        describe: 'Room to publish to'
      })  
      .option('msg', {
        type: 'string',
        alias: 'm',
        describe: 'Message to publish'
      })      
    },
    (argv) => {
      const config = configer.readConfig(argv.key);

      if (argv.usr && argv.pwd) {
        authorizer.signIn({
          username: argv.usr,
          password: argv.pwd,
        }, config)
        .then(currentUserCredentials => {
          return iotworker.pub({
            room: argv.room,
            msg: argv.msg
          }, currentUserCredentials)         
        })
        .then(result => {
            console.log('pub:', result)
            process.exit()
        })
        .catch(err => {
          console.error(err)
        })        

      } else {
        authorizer.signIn({
          username: config.usr,
          password: config.pwd,
        }, config)
        .then(currentUserCredentials => {
          return iotworker.pub({
            room: argv.room,
            msg: argv.msg
          }, currentUserCredentials)
        })
        .then(result => {
            console.log('pub:', result)
            process.exit()
        })        
        .catch(err => {
          console.error(err)
        })
      }
    }
  )
  .example('$0 pub -u user -p pass -r myroom -m msg -k default', '')
  .example('$0 pub -r myroom -m msg -k default', '')
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

