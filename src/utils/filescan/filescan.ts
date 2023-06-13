// todo need to run freshclam in docker to start up clamdscan

const NodeClam = require("clamscan");

export default class FileScan {
  filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async scanFile() {
    const ClamScan = new NodeClam().init({
      clamscan: {
        path: process.env.CLAMSCAN_LOCATION,
        db: null,
        active: true,
      },
    });

    const { isInfected, viruses } = await ClamScan.then((clamscan: any) => {
      return clamscan.isInfected(this.filepath);
    });

    return { isInfected, viruses };
  }
}
