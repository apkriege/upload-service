import fs from "fs";
import Uploader from "../uploader";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import dotenv from 'dotenv';
dotenv.config();

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY  = process.env.AWS_SECRET_ACCESS_KEY || "";

export default class S3 extends Uploader {
  private readonly s3Client: any;

  constructor(options?: any) {
    super(options);
    this.cloud = 'aws';
    this.s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private getS3Params() {
    return {
      Bucket: this.bucket, // replace with your bucket name
      Key: this.destinationFilePath, // replace with your desired key name
      Body: fs.createReadStream(this.filepath), // replace with your file path
    };
  }

  private createUpload() {
    const params = this.getS3Params();

    return new Upload({
      client: this.s3Client,
      params: params,
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false, // optional manually handle dropped parts
    });
  }

  private async bucketExists(): Promise<boolean> {
    const params = {
      Bucket: this.bucket,
    };

    try {
      await this.s3Client.send(new HeadBucketCommand(params));
      return true;
    } catch (err) {
      return false;
    }
  }

  public async upload(): Promise<any> {
    if (!(await this.bucketExists())) {
      return Promise.reject({
        status: "error",
        message: "Bucket does not exist",
      });
    }

    const upload = this.createUpload();
  
    return new Promise((resolve, reject) => {
      upload.on("httpUploadProgress", (progress: any) => {
        const percentage = Math.round((progress.loaded / progress.total) * 100);
        this.setUploadProgress(percentage);
      });

      upload.done().then((result: any) => {
        this.setCloudLink(result.Location);
        resolve('File uploaded to S3');
      })
      .catch((err: Error) => {
        console.error("Error uploading to S3:", err);
        reject({
          status: "error",
          message: "Error uploading to S3"
        })
      });
    })
  }
}