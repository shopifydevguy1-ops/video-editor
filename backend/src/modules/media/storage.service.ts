import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: 'r2' | 's3';
  private s3Client: AWS.S3;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.provider = (this.configService.get<string>('STORAGE_PROVIDER') || 'r2') as 'r2' | 's3';
    this.bucketName =
      this.provider === 'r2'
        ? this.configService.get<string>('R2_BUCKET_NAME') || ''
        : this.configService.get<string>('S3_BUCKET_NAME') || '';

    this.publicUrl =
      this.provider === 'r2'
        ? this.configService.get<string>('R2_PUBLIC_URL') || ''
        : `https://${this.bucketName}.s3.amazonaws.com`;

    this.initializeS3Client();
  }

  private initializeS3Client() {
    if (this.provider === 'r2') {
      // Cloudflare R2 uses S3-compatible API
      this.s3Client = new AWS.S3({
        endpoint: `https://${this.configService.get<string>('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '',
        signatureVersion: 'v4',
        region: 'auto',
      });
    } else {
      // AWS S3
      this.s3Client = new AWS.S3({
        region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'media' | 'renders' | 'audio' | 'thumbnails',
    userId: string,
  ): Promise<{ url: string; key: string }> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const key = `${folder}/${userId}/${fileName}`;

    try {
      const uploadResult = await this.s3Client
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read', // Make files publicly accessible
        })
        .promise();

      const url = this.provider === 'r2' 
        ? `${this.publicUrl}/${key}`
        : uploadResult.Location;

      return { url, key };
    } catch (error: any) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    folder: 'media' | 'renders' | 'audio' | 'thumbnails',
    userId: string,
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${userId}/${fileName}`;

    try {
      const uploadResult = await this.s3Client
        .upload({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: 'public-read',
        })
        .promise();

      const url = this.provider === 'r2'
        ? `${this.publicUrl}/${key}`
        : uploadResult.Location;

      return { url, key };
    } catch (error: any) {
      this.logger.error(`Failed to upload buffer: ${error.message}`, error.stack);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3Client
        .deleteObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();
    } catch (error: any) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      return this.s3Client.getSignedUrlPromise('getObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
      });
    } catch (error: any) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }
}

