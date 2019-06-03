var socket = io();

function quickjoin() {
  let name = $("#username").val();
  if (!name) {
    swal("Error!", "You need to add a name first!", "error");
  } else {
    console.log(name, "pressed quickjoin");
    socket.emit("getrooms");
  }
}

socket.on("return", data => {
  console.log(data[0]);
  if (data.length) {
    $("#roomname").val(data[0]);
    $("#myForm").submit();
  } else {
    $("#roomname").val(Math.floor(Math.random(2, 100) * 1000));
    $("#myForm").submit();
  }
  console.log("recieved something");
});
