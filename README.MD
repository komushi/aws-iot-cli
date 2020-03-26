# aws-iot-cli
This is the CLI tool to access aws iot with websocket over mqtt.

## 1. Backend Preparation
### 1-1. Create an identity pool IAM role with this policy, Create an IoT Policy <mypolicy> with this policy
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish"      
      ],
      "Resource": [
        "arn:aws:iot:ap-northeast-1:801701848198:topic/${cognito-identity.amazonaws.com:aud}/*/${cognito-identity.amazonaws.com:sub}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:ap-northeast-1:801701848198:topicfilter/${cognito-identity.amazonaws.com:aud}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Receive"      
      ],
      "Resource": [
        "arn:aws:iot:ap-northeast-1:801701848198:topic/${cognito-identity.amazonaws.com:aud}/*"
      ]
    },    
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "arn:aws:iot:ap-northeast-1:801701848198:client/${cognito-identity.amazonaws.com:sub}"
      ],
      "Condition": {
        "StringEquals": {
          "iot:ClientId": "${cognito-identity.amazonaws.com:sub}"
        }
      }
    }   
  ]
}
```
### 1-2. Prepare cognito userpool, identity pool, authenticated role

### 1-3. Prepare aws-exports.json
```
{
  "aws_project_region": "ap-northeast-1",
  "aws_cognito_identity_pool_id": "ap-northeast-1:935ae280-1240-4605-b254-e3eec740eec0",
  "aws_cognito_region": "ap-northeast-1",
  "aws_user_pools_id": "ap-northeast-1_OianBTW1F",
  "aws_user_pools_web_client_id": "edn58mvdk5k2lq17f51opqlg6",
  "aws_pubsub_region": "ap-northeast-1",
  "aws_pubsub_endpoint": "wss://a3uuibp82clsgz-ats.iot.ap-northeast-1.amazonaws.com/mqtt",
  "oauth": {}
}
```

## 2. Usage

### 2-1. Installation
```
$ npm install -g aws-iot-cli
```

### 2-2. Configuration
```
$ aws-iot config -s aws-exports.json -k default -u <user> -p <pass>
```

### 2-3. User SignUp & Confirmation
```
$ aws-iot signup -u <user> -p <pass> -e <abc@example.com> -k default
```

```
$ aws-iot confirm -u <user> -c <code> -k default
```

### 2-4. Use Subscribe to Connect for the 1st time
```
$ aws-iot sub -k default
authResult - group admins need to accept users with this info {
  username: <user>,
  identityId: <identityId>,
  identityPoolId: <identityPoolId>
}
```

### 2-5. Use admin role to allow this identity
```
$ aws iot attach-policy --policy-name <mypolicy> --target <identityId>
```

### 2-6. Publish some message
```
$ aws-iot pub -r <room> -m <msg> -k default
```