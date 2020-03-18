# aws-iot-cli
This is the CLI tool to access aws iot with websocket over mqtt.


## 1. Preparation

### 1-1. Clone project
```
$ git clone https://github.com/komushi/aws-iot-cli.git
```

### 1-2. Download libraries
```
cd aws-iot-cli
npm install
```

### 1-3. Prepare aws-exports.js
Copy the src/aws-exports.js from vue-amplify-s3 and add a getConfig function.
#### 1-3-1. aws-exports.js example
```
const awsmobile = {
    "aws_project_region": "ap-northeast-1",
    "aws_cognito_identity_pool_id": "ap-northeast-1:93bdb768-e14c-46e2-b048-601a5639ef5e",
    "aws_cognito_region": "ap-northeast-1",
    "aws_user_pools_id": "ap-northeast-1_clXt3clkz",
    "aws_user_pools_web_client_id": "3fa32imgbqss0f0f0b0p66pg28",
    "oauth": {}
};

module.exports.getConfig = () => {
   return awsmobile;
};
```