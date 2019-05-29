var socket = io();
var localrooms = [];
var seed = 1;

socket.on("connect", () => {
  console.log("connected");
});

function quickjoin() {
  socket.emit("getrooms");
  console.log("quickjoin");
  $("#username").val("guest");
  if (localrooms.length > 0) {
    $("#roomname").val(localrooms[0]);
  } else {
    $("#roomname").val(random());
  }
  // $("#myForm").submit();
}

socket.on("getrooms", rooms => {
  localrooms = rooms;
});

function random() {
  return Math.round(Math.random() * 100) + 1;
}
