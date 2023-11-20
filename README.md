# GCP and S3 File Upload Microservice
File uploader service for GCS and S3

## Setup
Create a .env file in the root directory witht the following variables
```
PORT=3002
NODE_ENV=LOCAL
GCP_PROJECT_ID=<GCP project id>
GCS_BUCKET_NAME=<GCS bucket name>
AWS_ACCESS_KEY_ID=<AWS access key>
AWS_SECRET_ACCESS_KEY=<AWS secret key>
AWS_BUCKET_NAME=<AWS bucket name>
CLAMAV_LOCATION=<ClamAV location>
```
Install dependencies and start the server
- npm install
- npm run dev

If you are using a GCS bucket you must authenticate your machine via gcloud tools
- First install gcloud CLI https://cloud.google.com/sdk/docs/install
- Next authenticate your machine to GCP. And in your terminal run <code>gcloud auth application-default login</code>

If you are using an AWS bucket use the keys in the same way we currently use for the apex-api and if you need them reach out to Adam or Walker.

## Install ClamAV
* If this step holds you up just comment the method out in the index.ts

ClamAV is the Anitvirus scanner used to scan files before uploading
- This guide will explain how to install locally - https://docs.clamav.net/manual/Installing.html
- Docker repo for ClamAV - https://hub.docker.com/r/clamav/clamav
- Quick install guide for local on mac - https://gist.github.com/gagarine/9168c1b7e4b5f55cb3254582e30d808e

## API
- POST /upload/:cloudEnvironment/:bucketName

Optional fields:
- uploadId: string type; Used to open a socket on a specific channel if you need to listen to the progress of the upload.
- destination: string type: Used if you want the file in a sub directory on the bucket otherwise it will be sent to the root eg. {rootFolder}/{subFolder}. No slashes on either end.



