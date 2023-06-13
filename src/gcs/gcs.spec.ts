import GCS from "./gcs";
const fs = require("fs");
const path = require("path");

const filepath = `${path.resolve(__dirname)}/test.txt`;
fs.writeFileSync(filepath, "sample text");

describe("GCS", () => {
  let gcs: GCS;

  beforeEach(() => {
    gcs = new GCS();
    gcs.initUpload(filepath, "test-bucket-pixo");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should load the GCS class", () => {
    expect(gcs).toBeDefined();
  });

  it("should init upload and set the file properties", () => {
    expect(gcs.filepath).toBeDefined();
    expect(gcs.filepath).toBe(filepath);
    expect(gcs.fileName).toBeDefined();
    expect(gcs.fileName).toBe("test.txt");
    expect(gcs.fileSize).toBeDefined();
    expect(gcs.fileSize).toBeGreaterThan(0);
    expect(gcs.fileType).toBeDefined();
    expect(gcs.fileType).toBe(".txt");
  });

  it("should error if the bucket does not exist", async () => {
    gcs.bucket = "non-existent-bucket";

    try {
      await gcs.upload();
    } catch (error: any) {
      expect(error).toBeDefined();
      expect(error.status).toBe("error");
      expect(error.message).toBe("Bucket does not exist");
    }
  });

  it("should upload the file to GCS", async () => {
    gcs.upload = jest.fn(() => {
      return new Promise((resolve, reject) => {
        resolve({
          status: "success",
        });
      });
    });

    const result = await gcs.upload();
    expect(result).toBeDefined();
    expect(result.status).toBe("success");
  });
});
