### 1. Use curl to upload files more than 1GB in size.

https://stackoverflow.com/questions/51680281/how-do-i-upload-a-file-to-a-pre-signed-url-in-aws

```
const Promise = require('bluebird');
const cmd = require('node-cmd');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd }); 

async function uploadFile(url, fileName) { 
    await throwIfCurlNotInstalled();
    console.log('uploadFile: Uploading file', {
        fileName
    });
    const command = `curl -T ${fileName} "${url}"`;
    try {
        let result = await getAsync(command);
        result.forEach(line => console.log(line));
        console.log('uploadFile: File uploaded', {
            fileName,
        });
    } catch (e) {
        console.error('uploadFile: Error uploading file', {
            fileName
        });
        console.error(e);
    }
}
async function throwIfCurlNotInstalled() {
    try {
        await getAsync(`curl -V`);
    } catch (e) {
        throw 'curl is not installed';
    }
}
```

### 2. When the amplify-js supports Storage in node.js mode we can use the following logic.

https://github.com/aws-amplify/amplify-js/issues/3453

```
const uploadFile = async ({fileKey, data}, fileContentType = "binary/octet-stream", s3level = "protected") => {

    await Amplify.Storage.put(
        fileKey, 
        JSON.stringify(data), { 
            level: s3level,
            contentType: 'application/json'
        }).catch(e => {
      console.log("storage.put", e);
      throw e;
    });
}
```