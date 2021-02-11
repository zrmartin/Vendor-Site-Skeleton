const aws = require('aws-sdk');

exports.handler = async (event, context) => {
  console.log("Function `upload Url` invoked")
  aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
    signatureVersion: 'v4',
  });

  const s3 = new aws.S3();
  const post = await s3.createPresignedPost({
    Bucket: process.env.S3_BUCKET_NAME,
    Fields: {
      key: event.queryStringParameters.file,
    },
    Expires: 60, // seconds
    Conditions: [
      ['content-length-range', 0, 10000000], // up to 10 MB
    ],
  });

  return {
    statusCode: 200,
    body: JSON.stringify(post)
  }
}