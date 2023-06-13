import fs from "fs";
import path from "path";

type Options = {
  destinationDirectory?: string;
  socket?: any;
}

export default class Uploader {
  cloud: string = "";
  bucket: string = "";
  filepath: string = "";
  fileName: string = "";
  fileType: string = "";
  fileSize: number = 0;
  destinationFilePath: string = "";
  cloudLink?: string = "";
  destinationDirectory?: string = "";
  socket?: any;

  constructor( options?: Options ) {
    this.socket = options?.socket;
    this.destinationDirectory = options?.destinationDirectory;
  }

  initUpload(filepath: string, bucket: string) {
    this.filepath = filepath;
    this.bucket = bucket;
    this.setFileProperties();
    return this;
  }

  setFileProperties() {
    const fileStats = fs.statSync(this.filepath);
    this.fileName = path.basename(this.filepath);
    this.fileSize = fileStats.size;
    this.fileType = path.extname(this.filepath);
    this.setDestinationDirectory();
  }

  setDestinationDirectory() {
    this.destinationFilePath = this.destinationDirectory ? `${this.destinationDirectory}/${this.fileName}` : this.fileName;
    return this;
  }

  setUploadStatus(status: string) {
    if (this.socket) {
      this.socket.emit("uploadStatus", status);
    }
  }

  setUploadProgress(progress: number) {
    if (this.socket) {
      this.socket.emit("uploadProgress", progress);
    }
  }

  setCloudLink(cloudLink: string) {
    this.cloudLink = cloudLink;
  }

  getUploadResult(fileLocation: string) {
    return {
      cloud: this.cloud,
      bucket: this.bucket,
      fileName: this.fileName,
      fileSize: this.fileSize,
      bucketPath: this.destinationDirectory,
      link: this.cloudLink,
      region: "us-east-1",
    };
  }
}