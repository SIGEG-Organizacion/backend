import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();


const s3 = new AWS.S3({
  endpoint: process.env.B2_ENDPOINT, 
  accessKeyId: process.env.B2_KEY_ID, 
  secretAccessKey: process.env.B2_APPLICATION_KEY,
  region: "eu-central-003", // Región de Backblaze B2
  signatureVersion: "v4", 
  s3ForcePathStyle: true, 
});

export default s3;
