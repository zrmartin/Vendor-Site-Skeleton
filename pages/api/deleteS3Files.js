import aws from "aws-sdk"

module.exports = async (req, res) => {
  console.log("Function `delete S3 Files` invoked")
  let { imageKeys } = req.body;

  aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    signatureVersion: 'v4',
  });

  const fileObjects = imageKeys.map(imageKey => ({
    Key: imageKey
  }))

  var deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
          Objects: fileObjects
      }
  };    
  const s3 = new aws.S3();
  const results = await s3.deleteObjects(deleteParams).promise();

  res.json({
    body: results
  })
}