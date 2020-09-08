# aws-iot-cli
This is the chatroom-like CLI tool to access aws iot with websocket over mqtt. Credentials managed by Cognito User Pool.

## Use-case & Terms
* cognito-identity.amazonaws.com:aud => ID of a cognito identity pool which stands for a unique organization such as a department or a company
* cognito-identity.amazonaws.com:sub => Identity ID which belongs to a cognito identity pool which stands for a user inside this organization
* With a prepared Cognito Identity Pool with a Cognito User Pool as IDP. The example source shows the easy implementation for a slack-like instant messaging system.
* If you need to make it even closer as Slack features you will need to persist data and save the retreived the messages foe each user and/or each room.

## 1. Backend Preparation
### 1-1. Create an identity pool IAM role with this policy, Create an IoT Policy <mypolicy> with this policy example, use your own region and account number.
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
        "arn:aws:iot:<region>:<account>:topic/${cognito-identity.amazonaws.com:aud}/*/${cognito-identity.amazonaws.com:sub}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe"
      ],
      "Resource": [
        "arn:aws:iot:<region>:<account>:topicfilter/${cognito-identity.amazonaws.com:aud}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Receive"      
      ],
      "Resource": [
        "arn:aws:iot:<region>:<account>:topic/${cognito-identity.amazonaws.com:aud}/*"
      ]
    },    
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": [
        "arn:aws:iot:<region>:<account>:client/${cognito-identity.amazonaws.com:sub}*"
      ],
      "Condition": {
        "StringLike": {
          "iot:ClientId": "${cognito-identity.amazonaws.com:sub}*"
        }
      }
    }   
  ]
}
```
### 1-2. Prepare cognito userpool, identity pool, authenticated role.
* Follow the following guide to create a Identity Pool
https://docs.aws.amazon.com/cognito/latest/developerguide/getting-started-with-identity-pools.html#create-identity-pool
* Follow the following guide to create a User Pool
https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-as-user-directory.html

* Assign the User Pool and Web Client as the IDP of the Identity Pool.

### 1-3. Prepare aws-exports.json, below is an example. Please replace with your own values.
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
* Config with the provided endpoints and give the configuration a name as 'default'.
* Preset the user and password as well.
```
$ aws-iot config -s aws-exports.json -k default -u <user> -p <pass>
```

### 2-3. User SignUp & Confirmation
* Signup with the user/password and the email address with the defined configuration name.
```
$ aws-iot signup -u <user> -p <pass> -e <abc@example.com> -k default
```

* After receiving an email confirm your account
```
$ aws-iot confirm -u <user> -c <code> -k default
```

### 2-4. Use Subscribe to Connect for the 1st time
* Login for the first time using the configuration defined
```
$ aws-iot sub -k default
authResult - group admins need to accept users with this info {
  username: <user>,
  identityId: <identityId>,
  identityPoolId: <identityPoolId>
}
```

### 2-5. Use admin role to allow this identity
* As an admin grant access to this identity(User)
```
$ aws iot attach-policy --policy-name <mypolicy> --target <identityId>
```

### 2-6. Publish some message
* After finishing the previous steps the accepted user is able to use AWS IoT as a message broker.
* Argument '-r' means a room to group messages in different rooms.
```
$ aws-iot pub -r <room> -m <msg> -k default
```