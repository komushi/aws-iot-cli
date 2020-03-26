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
*Copy and edit the json value from /amplify-config/src/aws-exports.js*

#### 1-3-1. aws-exports.json example
*Need to add aws_pubsub_region and aws_pubsub_endpoint*
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

```
aws iot detach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:51615dfc-7c3f-4d6d-acf2-6328279692ef'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:51615dfc-7c3f-4d6d-acf2-6328279692ef'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:76d6f549-28eb-498d-a516-04294235d82c'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:ec680285-6bdc-41eb-ae36-632dad8523cd'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:c373dc99-558d-44bd-8d41-6e038010d0fe'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:4901c0ad-463e-4b69-a910-345d67aa8a00'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:594f3d7b-7c0b-4862-88d1-c8ba893aa295'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:5d33f33c-3eea-434d-9b38-abfcdcb378d6'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:9e7967e2-7859-441e-a19d-cefd55d40243'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:bbe4ded7-b33b-416a-9bf1-b1d1aa9e25ec'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:c24b54ff-a8d3-4410-81bd-b056b638aa83'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:bf008779-c161-4812-8d90-01d7614acc22'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:9b8de7cb-b4df-47fd-bac3-19eb84d2baad'

aws iot attach-policy --policy-name 'iotFullAccess' --target 'ap-northeast-1:7646eed5-8344-4b67-80cf-9c9534c89c7f'

```

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
        "arn:aws:iot:ap-northeast-1:801701848198:topic/${cognito-identity.amazonaws.com:sub}*"
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