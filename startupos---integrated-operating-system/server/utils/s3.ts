
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const uploadToS3 = async (file: any, key: string) => {
  // If no credentials, simulate upload for dev environment
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.log('[Mock S3] Uploading file:', key);
    return `https://mock-s3.startupos.dev/${key}`;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await (s3Client as any).send(command);
  return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};
