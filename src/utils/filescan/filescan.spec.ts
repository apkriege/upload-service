import FileScan from "./filescan";

// create a simple test file and set it to the test directory
const fs = require("fs");
const path = require("path");
const testDir = path.resolve(__dirname);
fs.writeFileSync(`${testDir}/test.txt`, "test");
const filepath = `${testDir}/test.txt`;

describe("FileScan", () => {
  let fileScan: FileScan;

  beforeEach(() => {
    fileScan = new FileScan(filepath);
  });

  describe("scan", () => {
    it("should load the FileScan class", async () => {
      expect(fileScan).toBeDefined();
      expect(fileScan.filepath).toBeDefined();
      expect(fileScan.filepath).toBe(filepath);
    });

    it("should scan the file for viruses", async () => {
      fileScan.scanFile = jest.fn(() => {
        return new Promise((resolve, reject) => {
          resolve({
            isInfected: false,
            viruses: [],
          });
        });
      });

      const result = await fileScan.scanFile();
      expect(result).toBeDefined();
      expect(result.isInfected).toBe(false);
      expect(result.viruses).toHaveLength(0);
    });
  });
});
