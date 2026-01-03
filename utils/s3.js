// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // export const getSignedUploadUrl = async ({ fileName, fileType, folder }) => {
// //   const key = `${folder}/${Date.now()}-${fileName}`;

// //   const command = new PutObjectCommand({
// //     Bucket: process.env.AWS_BUCKET,
// //     Key: key,
// //     ContentType: fileType,
// //   });

// //   const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

// //   return {
// //     uploadUrl,
// //     fileUrl: `https://${process.env.AWS_BUCKET}.s3.amazonaws.com/${key}`,
// //   };
// // };

// export const getSignedUploadUrl = async ({ fileName, fileType, folder }) => {
//   const key = `${folder}/${Date.now()}-${fileName}`;

//   const command = new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET,
//     Key: key,
//     ContentType: fileType,
//   });

//   const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

//   return {
//     uploadUrl,
//     // CHANGE THIS: Return only the key/path to store in the DB
//     fileUrl: `/${key}`, 
//   };
// };

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getSignedUploadUrl = async ({ fileName, fileType, folder }) => {
  const timestamp = Date.now();
  const key = `${folder}/${timestamp}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ContentType: fileType,
    // Optional: ACL: 'public-read' // Only if bucket allows ACLs
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return {
    uploadUrl,
    fileUrl: `/${key}`, // Ensure this starts with a slash
  };
};