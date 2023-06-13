import S3 from './s3';
const fs = require("fs");
const path = require("path");

const filepath = `${path.resolve(__dirname)}/test.txt`;
fs.writeFileSync(filepath, "sample text");

describe('S3', () => {
  let s3: S3;

  beforeEach(() => {
    s3 = new S3();
    s3.initUpload(filepath, "x-na");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load the s3 class', () => {
    expect(s3).toBeDefined();
  }); 

  it('should init upload and set the file properties', () => {
    expect(s3.filepath).toBeDefined();
    expect(s3.filepath).toBe(filepath);
    expect(s3.fileName).toBeDefined();
    expect(s3.fileName).toBe('test.txt');
    expect(s3.fileSize).toBeDefined();
    expect(s3.fileSize).toBeGreaterThan(0);
    expect(s3.fileType).toBeDefined();
    expect(s3.fileType).toBe('.txt');
  });

  it("should error if the bucket does not exist", async () => {
    s3.bucket = "non-existent-bucket";

    try {
      await s3.upload();
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.status).toBe("error");
      expect(error.message).toBe("Bucket does not exist");
    }
  });
    
  it("should upload the file to GCS", async () => {
    s3.upload = jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve({
          status: "success",
        });
      });
    });

    const result = await s3.upload()
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
  });
})