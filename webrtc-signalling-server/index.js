let port = process.env.PORT || 6000;

let IO = require("socket.io")(port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

IO.use((socket, next) => {
  if (socket.handshake.query) {
    let callerId = socket.handshake.query.callerId;
    socket.user = callerId;
    next();
  }
});

IO.on("connection", (socket) => {
  console.log(socket.user, "Connected");
  socket.join(socket.user);

  socket.on("makeCall", (data) => {
    let calleeId = data.calleeId;
    let rtcMessage = data.rtcMessage;
    socket.to(calleeId).emit("newCall", {
      callerId: socket.user,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("answerCall", (data) => {
    let callerId = data.callerId;
    let rtcMessage = data.rtcMessage;

    socket.to(callerId).emit("callAnswered", {
      callee: socket.user,
      rtcMessage: rtcMessage,
    });
  });

  socket.on("ICEcandidate", (data) => {
    let calleeId = data.calleeId;
    let iceCandidate = data.rtcMessage;

    socket.to(calleeId).emit("ICEcandidate", {
      sender: socket.user,
      iceCandidate: iceCandidate,
    });
  });
});
