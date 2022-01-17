const S3Client = require("aws-sdk/clients/s3");
const s3 = new S3Client({ region: process.env.S3_REGION });
var fs = require('fs');
const PNG = require('pngjs').PNG;

module.exports = {
  deleteFile,
  createFile,
  getFile,
  createFilePath,
  checkDirectory,
  deleteFolder,
  createLocalFilePath
}

function checkDirectory(dir) {
  if (process.env.FILESYSTEM !== "S3" && !fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
}

function createFilePath(filename) {
  if (process.env.FILESYSTEM === "S3") {
    return "https://" + process.env.S3_BUCKET + ".s3.amazonaws.com/" + filename
  } else {
    return "./" + filename
  }
}

function createLocalFilePath(filename) {
  return "./" + filename
}

async function deleteFolder(path) {
  if (process.env.FILESYSTEM === "S3") {
    try {
      const listParams = {
          Bucket: process.env.S3_BUCKET,
          Prefix: path
      };

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
            Bucket: process.env.S3_BUCKET,
            Delete: { Objects: [] }
        };

        listedObjects.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(deleteParams).promise();

    } catch (err) {
      console.log(err);
    }
    
    return

  } else {
    fs.unlinkSync("./" + path)
    return
  }
}

async function deleteFile(path) {
  if (process.env.FILESYSTEM === "S3") {
    return await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET,
        Key: path
      })
      .promise();
  } else {
    fs.unlinkSync("./" + path)
    return
  }
}

async function createFile(path, data) {
  if (process.env.FILESYSTEM === "S3") {
    return await s3
      .upload({
        Bucket: process.env.S3_BUCKET,
        Key: path,
        Body: data,
        ContentType: "image/png",
        ACL: "public-read"
      })
      .promise();
  } else {
    fs.writeFileSync("./" + path, data);
    return
  }
}

async function getFile(path) {
  if (process.env.FILESYSTEM === "S3") {
    var img = await s3
      .getObject({ Bucket: process.env.S3_BUCKET, Key: path })
      .promise();
    var response = PNG.sync.read(img.Body)
    return response
  } else {
    var img = fs.readFileSync("./" + path);
    var response = PNG.sync.read(img)
    return response
  }
}
