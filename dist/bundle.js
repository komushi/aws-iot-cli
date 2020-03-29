"use strict";function e(e){return e&&"object"==typeof e&&"default"in e?e.default:e}var o=e(require("fs")),s=e(require("yargs")),r=e(require("@aws-amplify/core")),t=e(require("aws-sdk"));require("@aws-amplify/Auth"),require("@aws-amplify/PubSub");var i=e(require("@aws-amplify/pubsub/lib/Providers")),n=e(require("shortid")),a=e(require("node-fetch")),u=e(require("ws")),l=e(require("os")),c=e(require("path")),d="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};const{AWSIoTProvider:p}=i;d.fetch=a,d.navigator={},d.WebSocket=u;const g=e=>{const o=`${e}-${n.generate()}`,s=new p({clientId:o});r.default.addPluggable(s)},f=async(e,o,s)=>{await r.default.Auth.signIn(e,o);const[i,n]=await Promise.all([r.default.Auth.currentUserInfo(),r.default.Auth.currentUserCredentials()]);t.config=new t.Config({credentials:n,region:s});const a={username:i.username,identityId:n.identityId,identityPoolId:n.params.IdentityPoolId};return console.log("authResult - group admins need to accept users with this info",a),a};var m=async({username:e,password:o,room:s,msg:t},i)=>{r.default.configure(i);const n=await f(e,o,i.aws_cognito_region).catch(e=>{console.error("Authentication Failure!"),console.error(e)});if(n)return g(n.identityId),await(async(e,o,s,t)=>{try{return await r.default.PubSub.publish(`${e}/${s}/${o}`,{msg:t})}catch(e){return e}})(n.identityPoolId,n.identityId,s,t)},y=async({username:e,password:o},s)=>{r.default.configure(s);const t=await f(e,o,s.aws_cognito_region).catch(e=>{console.error("Authentication Failure!"),console.error(e)});if(t){g(t.identityId);try{r.default.PubSub.subscribe(`${t.identityPoolId}/#`).subscribe({next:e=>console.log("Message received",e.value),error:e=>console.error("subscribe error",e),close:()=>console.log("Done")})}catch(e){return e}}};d.fetch=a;const w=c.join(l.homedir(),".cognitorc");const b=()=>{let e;return e=o.existsSync(w)?JSON.parse(o.readFileSync(w,"utf8")):{},e};const _=e=>{r.default.configure(e)},h=async(e,o,s)=>{console.log("username",e),console.log("password",o);await r.default.Auth.signUp({username:e,password:o,attributes:{email:s}})};var k=e=>b()[e],U=e=>{const s={usr:e.usr,pwd:e.pwd,aws_user_pools_web_client_id:e.aws_user_pools_web_client_id,aws_user_pools_id:e.aws_user_pools_id,aws_cognito_region:e.aws_cognito_region,aws_cognito_identity_pool_id:e.aws_cognito_identity_pool_id,aws_pubsub_endpoint:e.aws_pubsub_endpoint,aws_pubsub_region:e.aws_pubsub_region,aws_project_region:e.aws_project_region};let r=b();r[e.key]=s;const t=JSON.stringify(r);o.writeFileSync(w,t)},C=async({username:e,password:o,email:s},r)=>{_(r);await h(e,o,s).catch(e=>{console.error("SignUp Failure!"),console.error(e)})},x=async({username:e,code:o},s)=>{_(s),r.default.Auth.confirmSignUp(e,o,{forceAliasCreation:!0}).then(e=>console.log(e)).catch(e=>console.log(e))};s.scriptName("aws-iot").usage("$0 <cmd> [args]").command("signup","",e=>{e.option("key",{type:"string",alias:"k",default:"default",describe:"the key of the config"}).option("usr",{type:"string",alias:"u",describe:"Cognito Userpool Username"}).option("pwd",{type:"string",alias:"p",describe:"Cognito Userpool User Password"}).option("email",{type:"string",alias:"e",describe:"Cognito Userpool User Email"})},e=>{const o=k(e.key);C({username:e.usr,password:e.pwd,email:e.email},o)}).example("$0 signup --usr user --pwd pass --email abc@example.com --key default","").command("confirm","",e=>{e.option("key",{type:"string",alias:"k",default:"default",describe:"the key of the config"}).option("usr",{type:"string",alias:"u",describe:"Cognito Userpool Username"}).option("code",{type:"string",alias:"c",describe:"Cognito Userpool User Confirmation Code"})},e=>{const o=k(e.key);x({username:e.usr,code:e.code},o)}).example("$0 confirm --usr user --code 123456 --key default","").command("sub","",e=>{e.option("key",{type:"string",alias:"k",default:"default",describe:"the key of the config"}).option("usr",{type:"string",alias:"u",describe:"Cognito Userpool Username"}).option("pwd",{type:"string",alias:"p",describe:"Cognito Userpool User Password"})},e=>{const o=k(e.key);e.usr&&e.pwd?y({username:e.usr,password:e.pwd},o):y({username:o.usr,password:o.pwd},o)}).example("$0 sub -u user -p pass -k default","").example("$0 sub -k default","").command("pub","",e=>{e.option("key",{type:"string",alias:"k",default:"default",describe:"the key of the config"}).option("usr",{type:"string",alias:"u",describe:"Cognito Userpool Username"}).option("pwd",{type:"string",alias:"p",describe:"Cognito Userpool User Password"}).option("room",{type:"string",alias:"r",describe:"Room to publish to"}).option("msg",{type:"string",alias:"m",describe:"Message to publish"})},e=>{const o=k(e.key);e.usr&&e.pwd?m({username:e.usr,password:e.pwd,room:e.room,msg:e.msg},o).then(e=>{console.log("pub:",e),process.exit()}):m({username:o.usr,password:o.pwd,room:e.room,msg:e.msg},o).then(e=>{console.log("pub:",e),process.exit()})}).example("$0 pub -u user -p pass -r myroom -m msg -k default","").example("$0 pub -r myroom -m msg -k default","").command("config","",e=>{e.option("set",{type:"string",alias:"s",describe:"the config json"}).option("key",{type:"string",alias:"k",default:"default",describe:"the key of the config"}).option("usr",{type:"string",alias:"u",describe:"Cognito Userpool Username"}).option("pwd",{type:"string",alias:"p",describe:"Cognito Userpool User Password"})},e=>{console.log("config",e),U(e)}).example("$0 config --set aws-exports.json","").example("$0 config --set aws-exports.json --key default --usr user --pwd pass","").config("set","configuration",(function(e){return JSON.parse(o.readFileSync(e,"utf-8"))})).version().help().argv;
