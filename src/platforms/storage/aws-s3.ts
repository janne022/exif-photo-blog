import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageListResponse, generateStorageId } from '.';
import { formatBytesToMB } from '@/utility/number';
const AWS_S3_ENDPOINT = process.env.NEXT_PUBLIC_AWS_S3_ENDPOINT ?? '';
const AWS_S3_BUCKET = process.env.NEXT_PUBLIC_AWS_S3_BUCKET ?? '';
const AWS_S3_REGION = process.env.NEXT_PUBLIC_AWS_S3_REGION ?? '';
const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY ?? '';
const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY ?? '';

export const AWS_S3_BASE_URL =
  AWS_S3_ENDPOINT && AWS_S3_BUCKET
    ? `${AWS_S3_ENDPOINT.replace(/\/$/, '')}/${AWS_S3_BUCKET}`
    : undefined;

export const awsS3Client = () => new S3Client({
  region: AWS_S3_REGION,
  endpoint: AWS_S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: AWS_S3_ACCESS_KEY,
    secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
  },
});

const urlForKey = (key?: string) => `${AWS_S3_BASE_URL}/${key}`;

export const isUrlFromAwsS3 = (url?: string) =>
  AWS_S3_BASE_URL && url?.startsWith(AWS_S3_BASE_URL);

export const awsS3PutObjectCommandForKey = (Key: string) =>
  new PutObjectCommand({ Bucket: AWS_S3_BUCKET, Key, ACL: 'public-read' });

export const awsS3Put = async (
  file: Buffer,
  fileName: string,
): Promise<string> =>
  awsS3Client().send(new PutObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key: fileName,
    Body: file,
    ACL: 'public-read',
  }))
    .then(() => urlForKey(fileName));

export const awsS3Copy = async (
  fileNameSource: string,
  fileNameDestination: string,
  addRandomSuffix?: boolean,
) => {
  const name = fileNameSource.split('.')[0];
  const extension = fileNameSource.split('.')[1];
  const Key = addRandomSuffix
    ? `${name}-${generateStorageId()}.${extension}`
    : fileNameDestination;
  return awsS3Client().send(new CopyObjectCommand({
    Bucket: AWS_S3_BUCKET,
    // FIX: Add a leading slash for compatability
    CopySource: `/${AWS_S3_BUCKET}/${fileNameSource}`,
    Key,
    ACL: 'public-read',
  }))
    .then(() => urlForKey(fileNameDestination));
};

export const awsS3List = async (
  Prefix: string,
): Promise<StorageListResponse> =>
  awsS3Client().send(new ListObjectsCommand({
    Bucket: AWS_S3_BUCKET,
    Prefix,
  }))
    .then((data) => data.Contents?.map(({ Key, LastModified, Size }) => ({
      url: urlForKey(Key),
      fileName: Key ?? '',
      uploadedAt: LastModified,
      size: Size ? formatBytesToMB(Size) : undefined,
    })) ?? []);

export const awsS3Delete = async (Key: string) => {
  awsS3Client().send(new DeleteObjectCommand({
    Bucket: AWS_S3_BUCKET,
    Key,
  }));
};
