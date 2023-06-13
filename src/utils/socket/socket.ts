const io = require("socket.io");

export default class SocketIO {
  io: any;
  channel: any;

  constructor(server: any) {
    this.io = this.setIo(server);
    this.io.on("connection", this.handleConnection);
  }

  setIo(server: any) {
    return io(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3003",
        ],
      },
    });
  }

  handleConnection(socket: any) {
    console.log("a user connected", socket.handshake.query);
    const { channel } = socket.handshake.query

    socket.join(channel)

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  }

  setChannel(channel: any) {
    this.channel = channel;
    return this;
  }

  emit(event: string, data: any) {
    if (this.channel) {
      this.io.to(this.channel).emit(event, data);
    }
  }
}
