const fs = require("fs");
const express = require("express");
const http = require("http");
require("dotenv").config();
const port = process.env.PORT || 3001;
const cors = require("cors");
const multer = require("multer");
const { FileScan, Socket, HttpError } = require("./utils");
const GCS = require("./gcs");
const S3 = require("./s3");

const app = express();
const server = http.createServer(app);
const socket = new Socket(server);

app.use(cors());

// TODO
// 1. Modify how socket is implemented
// 2. Test multiple file uploads
// 3. Add cucumber tests
// 4. Define and implement error handling
// 5. Add logging
// 6. Clean up code

// Set up multer upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: process.env.TMP_PATH,
    filename: (req: any, file: any, cb: any) => {
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: 1000000000 }, // 1000 MB file size limit
});

// RUNS FILE SCAN WITH CLAMAV
const runFileScan = async (file: any) => {
  const fileScan = new FileScan(file);
  const result = await fileScan.scanFile();

  if (result.isInfected) {
    throw new HttpError(409, "File is infected");
  }

  return result;
};

// UPLOADS FILE TO CLOUD PROVIDER
const uploadFile = async (file: any, cloud: string, bucket: string, options?: any) => {
  const uploader = {
    'aws': new S3(options),
    'gcs': new GCS(options)
  }[cloud];

  if (!uploader) {
    throw new HttpError(401, "Invalid cloud provider must be gcs or aws");
  }

  uploader.initUpload(file, bucket);
  await uploader.upload();
  return uploader.getUploadResult();
};

app.post("/upload/:cloud/:bucket", upload.single("file"), async (req: any, res: any) => {
  const destinationDirectory = req.body.destination || null;
  const channel = req.body.uploadId || null;
  socket.setChannel(channel);

  try {
    if (!req.file) {
      throw new HttpError(400, "Please upload a file");
    }

    const file = req.file.path;
    const { cloud, bucket } = req.params;
    const options = { socket, destinationDirectory };

    // UNCOMMENT TO ENABLE FILE SCANNING
    // if (process.env.NODE_ENV !== "LOCAL") {
    //   socket.emit("uploadState", "Scanning file for viruses...");
    //   await runFileScan(file);
    // }

    socket.emit("uploadState", `Syncing to ${cloud.toUpperCase()}`);
    const uploadResult = await uploadFile(file, cloud, bucket, options);
    console.log(uploadResult)
    socket.emit("uploadState", "Upload complete");

    console.log(file)
    fs.unlinkSync(file);

    res.status(200).json({ message: "File uploaded successfully", uploadResult });
  } catch (error: any) {
    console.log(error);

    fs.unlinkSync(req.file.path);
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

app.get("/health", (req: any, res: any) => {
  res.status(200).json({ message: "Server is running" });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
