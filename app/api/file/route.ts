import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

const Bucket = process.env.AWS_S3_BUCKET!
export const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url)
    const encodedPath = searchParams.get('path')!
    const decodedPath = decodeURIComponent(encodedPath);

    console.log(`[File Route] File Path: ${decodedPath}`)

    try {
        const result = await s3Client.send(
            new GetObjectCommand({
                Bucket,
                Key: decodedPath,
            })
        );

        const stream = result.Body as ReadableStream
        console.log(result.ContentType)
        const contentType = result.ContentType || 'application/octet-stream'

        return new Response(stream, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        console.error('Error fetching file from S3:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch file from S3' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}