'use server'
import { S3Client, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, CopyObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { Progress, Upload } from '@aws-sdk/lib-storage'
import { FileData } from '../types'
import { PLACEHOLDER_FILE_NAME } from '@/constants/file-constants'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const Bucket = process.env.AWS_S3_BUCKET!

export const uploadFile = async (
  file: FileData,
  userId: string,
  onProgress?: (progress: Progress) => void
) => {
  const { name, arrayBuffer, type } = file

  if (!arrayBuffer) {
    throw new Error('Array buffer is required')
  }

  const key = `${userId}/${_s3SanitizeFileName(name)}`

  console.log(`[S3 Operation]: Uploading ${key}`)

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
    onProgress?.(progress)
  });

  const data = await upload.done()

  return data
};

const _streamToBlob = async (stream) => {
  const chunks: Uint8Array[] = []

  for await (const chunk of stream) {
      chunks.push(chunk);
  }
  return new Blob(chunks, { type: 'application/pdf' });
};

export const downloadObject = async (path: string) => {
  const result = await s3Client.send(new GetObjectCommand(
    {
      Bucket,
      Key: path,
    })
  )

  return await _streamToBlob(result.Body)
};

export const deleteObject = async (path: string) => {
  const deleteParams = {
    Bucket,
    Key: path,
  };

  console.log(`[S3 Operation]: Deleting object with path: ${path}`)
  return s3Client.send(new DeleteObjectCommand(deleteParams));
};

export const fetchObjectPaths = async (prefix?: string): Promise<string[]> => {

  const listParams = {
    Bucket,
    Prefix: prefix,
  };

  console.log('[S3 Operation]: Fetching objects...')

  let objectPaths: string[] = [];

  try {
    const data = await s3Client.send(new ListObjectsV2Command(listParams))
    objectPaths = data.Contents?.map(item => (item.Key!)) || []
  } catch (e) {
    console.error(`[S3] Fetching objects failed: ${e}`)
  }

  console.log(`[S3 Operation]: Retrieved paths \n ${objectPaths}`)

  return objectPaths;
};

export const moveObject = async (sourcePath: string, destinationPath: string, newName?: string) => {
  const fileName = sourcePath.split('/').filter(Boolean).pop()!;
  const sanitizedFileName = _s3SanitizeFileName(newName || fileName);
  console.log(`[S3 Operation]: Moving ${sourcePath} to ${destinationPath}/${fileName}`)
  
  await s3Client.send(new CopyObjectCommand({
    Bucket,
    CopySource: `${Bucket}/${sourcePath}`,
    Key: `${destinationPath}/${sanitizedFileName}`,
  }));

  await s3Client.send(new DeleteObjectCommand({
    Bucket,
    Key: sourcePath,
  }));

  return { sourceKey: sourcePath, destinationKey: destinationPath };
}

export const createEmptyFolder = async (path: string) => {
  const key = `${path}/${PLACEHOLDER_FILE_NAME}`;

  console.log(`[S3 Operation]: Creating empty folder at ${key}`);

  try {
    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      Body: '', // Empty body to simulate an empty file
    });

    const result = await s3Client.send(command);
    console.log(`[S3 Operation]: Empty folder created at ${key}`);
    return result;
  } catch (error) {
    console.error(`[S3 Operation]: Error creating empty folder: ${error}`);
    throw error;
  }
};

const _s3SanitizeFileName = (fileName: string) => {
  const umlautsMap = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue'
  };

  let filename = fileName.replace(/[äöüßÄÖÜ]/g, char => umlautsMap[char] || '');
  filename = filename.replace(/[^a-zA-Z0-9_\-./ ]/g, '');
  filename = filename.replace(/\s+/g, '_')

  return filename;
}