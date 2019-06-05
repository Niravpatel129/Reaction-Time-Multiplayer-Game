const path = require("path");
const sleep = require("sleep");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
var connections = [];
const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");
const publicPath = path.join(__dirname, "./public");
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
app.use(express.static(publicPath));

io.on("connection", socket => {
  socket.on("getrooms", () => {
    console.log("get all rooms");
    let listofrooms = users.getRoomList();
    socket.emit("return", listofrooms);
  });

  connections.push(socket.id);

  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      console.log("Name and room name are required");
      return callback("Name and room name are required.");
    } else {
      socket.join(params.room);
      users.removeUser(socket.id);
      if (users.getUserName(params.name, params.room) === 1) {
        return callback("sorry, room has someone with this name already!");
      }
      users.addUser(socket.id, params.name, params.room);
      if (users.getUserSocketList(params.room).length >= 3) {
        return callback("sorry, room has 2 players already");
      }
    }

    io.in(params.room).emit("users", users.getUserList(params.room));
    socket.on("ready", data => {
      io.in(params.room).emit("users", users.getUserList(params.room));
      socket.to(params.room).emit("ready", data);
    });

    socket.on("forcereload", () => {
      io.in(params.room).emit("users", users.getUserList(params.room));
    });

    if (users.getUserSocketList(params.room).length === 2) {
      io.to(params.room).emit("start");
      console.log("emiting start game");
    }

    socket.on("dotsdata", data => {
      socket.to(params.room).emit("opponentcircles", data);
    });

    socket.on("mouseLocation", data => {
      socket.to(params.room).emit("mouselocation", data);
    });

    socket.on("clockended", data => {
      socket.to(params.room).emit("gamewinner", data);
    });

    socket.on("score", score => {
      socket.to(params.room).emit("score", score);
    });

    socket.on("hoveredVS", () => {
      io.in(params.room).emit("hoveredVS");
    });

    socket.on("leftVS", () => {
      io.in(params.room).emit("leftVS");
    });

    socket.on("winner", name => {
      io.in(params.room).emit("winner", name);
    });

    socket.on("showSnackbar", dat => {
      io.emit("showSnackbar", dat);
    });

    socket.on("disconnect", () => {
      var user = users.removeUser(socket.id);
      io.in(params.room).emit("clearlobby");
    });
  });
});

server.listen(port, () => {
  console.log(`Server is up on ${port}`);
});
