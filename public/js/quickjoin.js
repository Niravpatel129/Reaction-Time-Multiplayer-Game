var socket = io();
var holderval;
socket.on("connect", () => {
  console.log(window.location.search);
  switch (window.location.search) {
    case "?303":
      swal("Error!", "Your opponent quit!", "error");
  }
});

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

socket.on("showSnackbar", res => {
  console.log(res);
  holderval = res;
  console.log("showsnackbar");
  if (res) {
    showSnackbar(res);
  }
});

function showSnackbar(data) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";
  $("#winner1").text(data.localwinner);
  $("#loser1").text(data.localloser);
  $("#winnerscore").text(data.localwinnerscore);
  $("#loserscore").text(data.localloserscore);

  // After 3 seconds, remove the show class from DIV
  setTimeout(function() {
    x.className = x.className.replace("show", "");
  }, 3000);
}
