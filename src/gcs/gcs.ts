import fs from "fs";
import Uploader from "../uploader";
import { Bucket, Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "";

export default class GCS extends Uploader {
  private readonly storage: Storage;

  constructor(options?: any) {
    super(options);
    this.cloud = "gcs";
    this.storage = new Storage({ projectId: GCP_PROJECT_ID });
  }

  public async upload(): Promise<any> {
    const gcsBucketInstance = this.storage.bucket(this.bucket);

    if (!(await this.bucketExists(gcsBucketInstance))) {
      return Promise.reject({
        status: "error",
        message: "Bucket does not exist",
      });
    }

    const params = this.getGCSParams();
    const file = gcsBucketInstance.file(this.destinationFilePath);
    const uploadStream = file.createWriteStream(params);

    return this.sendFileToGCS(uploadStream);
  }

  private getGCSParams(): Object {
    return {
      destination: this.destinationFilePath,
      resumable: true, // Enable resumable uploads
      metadata: {
        contentType: this.fileType,
      },
    };
  }

  private async bucketExists(bucketInstance: Bucket): Promise<boolean> {
    const [exists] = await bucketInstance.exists();
    return exists;
  }

  private sendFileToGCS(uploadStream: any): Promise<any>{
    return new Promise((resolve, reject) => {
      uploadStream.on("error", (error: Error) => {
        console.error(`Error uploading file: ${error}`);
        reject({
          status: "error",
          message: "Error uploading to GCS"
        });
      });

      uploadStream.on("finish", () => {
        const gcsFilePath = `https://storage.googleapis.com/${this.bucket}/${this.destinationFilePath}`;
        this.setCloudLink(gcsFilePath);
        resolve('File uploaded to GCS');
      });

      uploadStream.on("progress", (progress: { bytesWritten: number }) => {
        const percentage = Math.round((progress.bytesWritten / this.fileSize) * 100);
        this.setUploadProgress(percentage);
      });

      fs.createReadStream(this.filepath).pipe(uploadStream);
    });
  }
}
