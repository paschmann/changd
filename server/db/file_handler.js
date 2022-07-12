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
  try {
    if (process.env.FILESYSTEM !== "S3" && !fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err) {
    console.log(err);
  }
}

function createFilePath(filename) {
  try {
    if (process.env.FILESYSTEM === "S3") {
      return "https://" + process.env.S3_BUCKET + ".s3.amazonaws.com/" + filename
    } else {
      return "/" + filename
    }
  } catch (err) {
    console.log(err);
  }
}

function createLocalFilePath(filename) {
  try {
    return "./" + filename
  } catch (err) {
    console.log(err);
  }
}

async function deleteFolder(path) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}

async function deleteFile(path) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}

async function createFile(path, data) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}

async function getFile(path) {
  try {
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
  } catch (err) {
    console.log(err);
  }
}
