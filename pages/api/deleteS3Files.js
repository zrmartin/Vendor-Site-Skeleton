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
  /* Results looks like
    {
      "Deleted":[
        {"Key":"490d8204-ef3e-428f-86d9-532c66d5eda3"}
      ],
      "Errors":[]
    }
  */
  res.json({
    body: results
  })
}