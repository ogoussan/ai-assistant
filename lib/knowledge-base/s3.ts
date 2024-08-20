import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Progress, Upload } from '@aws-sdk/lib-storage';
import { FileData } from '../types';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const Bucket = process.env.AWS_S3_BUCKET!;

export const uploadFile = async (
  file: FileData, 
  userId: string, 
  onProgress?: (progress: Progress) => void
) => {
  console.log('Uploading file to S3');
  const { name, arrayBuffer, type } = file;
  
  // Include userId in the S3 key
  const key = `${userId}/${name}`;

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: type,
    },
  });

  upload.on('httpUploadProgress', (progress) => {
    onProgress?.(progress);
  });

  const data = await upload.done();

  return data;
};

export const downloadFile = async (userId: string, fileName: string) => {
    const key = `${userId}/${fileName}`;
    
    const body = (
      await s3Client.send(
        new GetObjectCommand({
          Bucket,
          Key: key,
        })
      )
    ).Body;
  
    return body;
  };

  export const deleteFile = async (userId: string, fileName: string) => {
  const key = `${userId}/${fileName}`;
  
  const deleteParams = {
    Bucket,
    Key: key,
  };

  return s3Client.send(new DeleteObjectCommand(deleteParams));
};


